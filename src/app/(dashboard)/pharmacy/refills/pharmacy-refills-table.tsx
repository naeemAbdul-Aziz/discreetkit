"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { FileText, CheckCircle, Play, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  verifyPharmacyPrescription,
  processRefill,
} from "@/lib/pharmacy-actions";
import { getSupabaseClient } from "@/lib/supabase";
import { format } from "date-fns";

export function PharmacyRefillsTable({
  initialSubscriptions,
}: {
  initialSubscriptions: any[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<string | null>(
    null,
  );

  // Handlers
  const handleVerify = async (id: string, isValid: boolean) => {
    const result = await verifyPharmacyPrescription(id, isValid);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Prescription verified." });
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                prescription_verified: isValid,
                status:
                  isValid && s.status === "pending_verification"
                    ? "active"
                    : s.status,
              }
            : s,
        ),
      );
    }
  };

  const handleProcessRefill = async () => {
    if (!processingId) return;

    // Optimistic UI? No, wait for result since it creates order.
    try {
      const result = await processRefill(processingId);
      if (result.success) {
        toast({ title: "Refill Processed", description: result.message });
        setSubscriptions((prev) =>
          prev.map((s) => {
            if (s.id === processingId) {
              // Update next delivery date locally roughly or refresh
              // Better to refresh -> router.refresh()
              return { ...s, next_delivery_date: "Updating..." };
            }
            return s;
          }),
        );
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to process refill.",
        variant: "destructive",
      });
    }
    setProcessingId(null);
  };

  const loadPrescription = async (path: string) => {
    if (!path) return;
    const supabase = getSupabaseClient();
    const { data } = await supabase.storage
      .from("prescriptions")
      .createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      setPrescriptionUrl(data.signedUrl);
      setViewingPrescription(path);
    } else {
      toast({
        title: "Error",
        description: "Could not load document.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Next Refill</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prescription</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No assigned subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => {
                const isDue = new Date(sub.next_delivery_date) <= new Date();
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {sub.subscription_code}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {sub.product_name || "Product"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          isDue
                            ? "text-orange-600 font-bold"
                            : "text-muted-foreground"
                        }
                      >
                        {sub.next_delivery_date
                          ? format(
                              new Date(sub.next_delivery_date),
                              "MMM d, yyyy",
                            )
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "active" ? "default" : "secondary"
                        }
                      >
                        {sub.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.prescription_document_url ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              loadPrescription(sub.prescription_document_url!)
                            }
                            className="h-7 text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" /> View
                          </Button>
                          {sub.prescription_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(sub.id, true)}
                              className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.status === "active" && sub.prescription_verified && (
                        <Button
                          variant={isDue ? "default" : "secondary"}
                          size="sm"
                          onClick={() => setProcessingId(sub.id)}
                          className="h-8"
                        >
                          <Play className="h-3 w-3 mr-1" /> Process Refill
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!processingId}
        onOpenChange={(o) => !o && setProcessingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refill?</DialogTitle>
            <DialogDescription>
              This will create a new order for this subscription and update the
              next delivery date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleProcessRefill}>Confirm Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Prescription Dialog */}
      <Dialog
        open={!!viewingPrescription}
        onOpenChange={(o) => !o && setViewingPrescription(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Verification Document</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-50 rounded p-4 flex justify-center items-center min-h-[300px]">
            {prescriptionUrl ? (
              viewingPrescription?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={prescriptionUrl}
                  className="w-full h-[600px]"
                  title="Document Viewer"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prescriptionUrl}
                  alt="Prescription"
                  className="max-w-full max-h-[600px] object-contain"
                />
              )
            ) : (
              <div className="animate-pulse">Loading...</div>
            )}
          </div>
          <DialogFooter>
            {prescriptionUrl && (
              <Button variant="outline" asChild>
                <a
                  href={prescriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
