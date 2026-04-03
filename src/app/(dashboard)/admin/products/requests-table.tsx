"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Package } from "lucide-react";
import { moderateProductRequest } from "@/lib/admin-actions";
import { useToast } from "@/hooks/use-toast";
import { ProductSheet } from "./product-sheet";

interface ProductRequest {
  id: number;
  product_name: string;
  description: string | null;
  pharmacyName: string;
  pharmacyLocation: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function RequestsTable({
  initialRequests,
  categories = [],
}: {
  initialRequests: ProductRequest[];
  categories?: any[];
}) {
  const [requests, setRequests] = useState<ProductRequest[]>(initialRequests);
  const [processing, setProcessing] = useState<number | null>(null); // ID of request being processed
  const { toast } = useToast();

  // For approval flow - reusing ProductSheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] =
    useState<ProductRequest | null>(null);

  // Map request fields to product form
  const getProductFromRequest = (req: ProductRequest) => ({
    name: req.product_name,
    description: req.description,
    category: "",
    price_ghs: 0,
    stock_level: 0,
    image_url: "",
  });

  const handleApproveClick = (request: ProductRequest) => {
    setRequestToApprove(request);
    setIsSheetOpen(true);
  };

  // Intercept the ProductSheet's onSubmit logic.
  // Actually, ProductSheet calls `upsertProduct` directly.
  // We need `approveProductRequest` which *wraps* creation + status update.
  // Modification: ProductSheet is currently tightly coupled to `upsertProduct`.
  // Strategy: We can keep ProductSheet as is, but we need to create the product AND update the request.
  // If we just use ProductSheet, it creates a product but doesn't link it to the request.
  // Better approach:
  // 1. Create a special mode for ProductSheet? Or duplicate it? Duplication is bad.
  // 2. OR, we call `approveProductRequest` which takes `ProductFormValues`.
  // We can customize `ProductSheet` to accept an `onSubmit` prop override.
  // OR, simpler for now: Just use a custom Dialog here if ProductSheet is too rigid.
  // Let's check ProductSheet code again... it imports upsertProduct directly. Refactoring it to take an onSubmit prop is cleaner.

  // BUT, to avoid modifying too many files, I will use a simple implementation:
  // I will just use `approveProductRequest` which internally Creates Product.
  // I need a form to gather the missing details (Category, Price, Image) before calling `approve`.
  // I will reuse `ProductSheet` but I need to modify it to support a custom submit handler or "Request Mode".

  // Let's modify ProductSheet slightly to accept an `onSubmitOverride`.

  const handleReject = async (id: number) => {
    if (!confirm("Reject this request?")) return;
    setProcessing(id);
    const res = await moderateProductRequest(id, "rejected");

    if (res.success) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
      );
      toast({ title: "Rejected", description: "Request rejected." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.error || "Failed to reject.",
      });
    }
    setProcessing(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.product_name}</div>
                    {req.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {req.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{req.pharmacyName}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.pharmacyLocation}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved"
                          ? "success"
                          : req.status === "rejected"
                            ? "destructive"
                            : "pending"
                      }
                      className="font-black uppercase text-[10px] tracking-widest px-2.5 py-1"
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 text-green-700"
                          onClick={() => handleApproveClick(req)}
                          disabled={!!processing}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 text-red-700"
                          onClick={() => handleReject(req.id)}
                          disabled={!!processing}
                        >
                          {processing === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 
        We use a modified ProductSheet logic here. 
        Since we cannot pass onSubmit easily without changing ProductSheet prop types,
        I will create a WRAPPER or just modify ProductSheet.
        
        For now, let's assume we modify ProductSheet to take `onSubmitOverride`.
      */}
      <ProductSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={
          requestToApprove ? getProductFromRequest(requestToApprove) : undefined
        }
        categories={categories}
        // @ts-ignore - We will add this prop next
        requestId={requestToApprove?.id}
      />
    </div>
  );
}
