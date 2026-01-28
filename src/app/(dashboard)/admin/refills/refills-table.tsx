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
import {
  FileText,
  CheckCircle,
  XCircle,
  Store,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  assignPharmacyToSubscription,
  verifyPrescription,
} from "@/lib/admin-actions";
import { getSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

export function RefillsTable({
  initialSubscriptions,
  pharmacies,
}: {
  initialSubscriptions: any[];
  pharmacies: any[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("");
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<string | null>(
    null,
  );

  // Handlers
  const handleAssign = async () => {
    if (!assigningId || !selectedPharmacyId) return;
    const result = await assignPharmacyToSubscription(
      assigningId,
      parseInt(selectedPharmacyId),
    );
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Pharmacy assigned successfully.",
      });
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === assigningId
            ? {
                ...s,
                pharmacy_id: parseInt(selectedPharmacyId),
                pharmacy: pharmacies.find(
                  (p) => p.id === parseInt(selectedPharmacyId),
                ),
              }
            : s,
        ),
      );
      setAssigningId(null);
      setSelectedPharmacyId("");
    }
  };

  const handleVerify = async (id: string, isValid: boolean) => {
    const result = await verifyPrescription(id, isValid);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: isValid ? "Verified" : "Rejected",
        description: isValid
          ? "Prescription verified & activated."
          : "Prescription rejected.",
      });
      // Update local state optimistically
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

  const loadPrescription = async (path: string) => {
    if (!path) return;

    // Use server action to avoid RLS issues
    const { getPrescriptionUrlAction } = await import("@/lib/admin-actions");
    const result = await getPrescriptionUrlAction(path);

    if (result.signedUrl) {
      setPrescriptionUrl(result.signedUrl);
      setViewingPrescription(path);
    } else {
      console.error("Error loading document:", path, result.error);
      toast({
        title: "Error",
        description: "Could not load document: " + (result.error || "Unknown"),
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
              <TableHead>Patient / Contact</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => {
                // Parse helpful contact info
                const address = sub.delivery_address || {};
                const contactName =
                  sub.user_name || address.fullName || "Anonymous";
                const contactDetail =
                  sub.user_email || address.phone || sub.subscription_code;

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">
                      {sub.subscription_code}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{contactName}</span>
                        <span className="text-xs text-muted-foreground">
                          {contactDetail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {sub.product_name || "Product"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "default"
                            : sub.status === "pending_verification"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {sub.status.replace("_", " ")}
                      </Badge>
                      {sub.prescription_verified && (
                        <CheckCircle className="inline h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.pharmacy?.name ? (
                        <Badge variant="outline" className="gap-1">
                          <Store className="h-3 w-3" /> {sub.pharmacy.name}
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAssigningId(sub.id)}
                          className="text-xs h-7"
                        >
                          Assign Pharmacy
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {sub.prescription_document_url && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              loadPrescription(sub.prescription_document_url!)
                            }
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}

                        {!sub.prescription_verified && (
                          <>
                            <Button
                              variant="default"
                              size="icon"
                              className="h-8 w-8 bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerify(sub.id, true)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            {/* Reject button logic can be added later, simplified for now */}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign Pharmacy Dialog */}
      <Dialog
        open={!!assigningId}
        onOpenChange={(o) => !o && setAssigningId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Pharmacy</DialogTitle>
            <DialogDescription>
              Select a pharmacy to handle this subscription.
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={setSelectedPharmacyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Pharmacy" />
            </SelectTrigger>
            <SelectContent>
              {pharmacies.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningId(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedPharmacyId}>
              Assign
            </Button>
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
