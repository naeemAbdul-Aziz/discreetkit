"use client";

import { useState, useEffect } from "react";
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
  Store,
  ExternalLink,
  Check,
  ChevronsUpDown,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import {
  assignPharmacyToSubscription,
  verifyPrescription,
  searchPharmacies,
} from "@/lib/admin-actions";
import {
  dashboardTable,
  adminRefillsCols,
  actions as actionStyles,
} from "@/components/ui/table-layout";
import { cn } from "@/lib/utils";

// Inline Pharmacy Combobox Component (same as orders table)
function PharmacyCombobox({
  subscriptionId,
  currentPharmacyId,
  currentPharmacyName,
  onAssign,
  loading,
}: {
  subscriptionId: string;
  currentPharmacyId: number | null;
  currentPharmacyName?: string;
  onAssign: (subId: string, pharmacyId: number, pharmacyName: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<
    { id: number; name: string; recommended?: boolean; is_24_7?: boolean }[]
  >([]);
  const [searching, setSearching] = useState(false);

  // Load pharmacies when popover opens
  useEffect(() => {
    if (open) {
      setSearching(true);
      searchPharmacies("").then((data) => {
        setPharmacies(data);
        setSearching(false);
      });
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      if (searchQuery) {
        setSearching(true);
        try {
          const data = await searchPharmacies(searchQuery);
          setPharmacies(data);
        } catch (e) {
          console.error(e);
        } finally {
          setSearching(false);
        }
      } else {
        // Reset to initial recommendations
        setSearching(true);
        searchPharmacies("").then((data) => {
          setPharmacies(data);
          setSearching(false);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-40 h-8 justify-between items-center"
          size="sm"
          disabled={loading}
        >
          <span className="truncate">
            {loading ? "Assigning..." : currentPharmacyName || "Unassigned"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pharmacy..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searching ? "Searching..." : "No pharmacy found."}
            </CommandEmpty>
            <CommandGroup>
              {pharmacies.map((pharmacy) => (
                <CommandItem
                  key={pharmacy.id}
                  value={pharmacy.name}
                  onSelect={() => {
                    onAssign(subscriptionId, pharmacy.id, pharmacy.name);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentPharmacyId === pharmacy.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="truncate">{pharmacy.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {pharmacy.is_24_7 && (
                      <Badge
                        variant="secondary"
                        className="h-5 text-[10px] px-1 bg-blue-100 text-blue-700"
                      >
                        24/7
                      </Badge>
                    )}
                    {pharmacy.recommended && (
                      <Badge
                        variant="secondary"
                        className="h-5 text-[10px] px-1 bg-green-100 text-green-700"
                      >
                        Best
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<string | null>(
    null,
  );

  const handleAssignPharmacy = async (
    subId: string,
    pharmacyId: number,
    pharmacyName: string,
  ) => {
    setAssigningId(subId);
    try {
      const result = await assignPharmacyToSubscription(subId, pharmacyId);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: `Assigned to ${pharmacyName}` });
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === subId
              ? {
                  ...s,
                  pharmacy_id: pharmacyId,
                  pharmacy: { name: pharmacyName },
                }
              : s,
          ),
        );
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to assign pharmacy",
        variant: "destructive",
      });
    } finally {
      setAssigningId(null);
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
    const { getPrescriptionUrlAction } = await import("@/lib/admin-actions");
    const result = await getPrescriptionUrlAction(path);
    if (result.signedUrl) {
      setPrescriptionUrl(result.signedUrl);
      setViewingPrescription(path);
    } else {
      toast({
        title: "Error",
        description: "Could not load document: " + (result.error || "Unknown"),
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className={dashboardTable.container}>
        <Table className={dashboardTable.table}>
          <TableHeader>
            <TableRow>
              <TableHead className={adminRefillsCols.codeHead}>Code</TableHead>
              <TableHead className={adminRefillsCols.patientHead}>
                Patient / Contact
              </TableHead>
              <TableHead className={adminRefillsCols.productHead}>
                Product
              </TableHead>
              <TableHead className={adminRefillsCols.statusHead}>
                Status
              </TableHead>
              <TableHead className={adminRefillsCols.pharmacyHead}>
                Pharmacy
              </TableHead>
              <TableHead className={adminRefillsCols.actionsHead}>
                Actions
              </TableHead>
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
                const address = sub.delivery_address || {};
                const contactName =
                  sub.user_name ||
                  address.name ||
                  address.fullName ||
                  "Anonymous";
                const contactDetail =
                  sub.user_email ??
                  sub.contact_phone ??
                  address.phone ??
                  sub.subscription_code;

                return (
                  <TableRow key={sub.id}>
                    <TableCell className={adminRefillsCols.codeCell}>
                      {sub.subscription_code}
                    </TableCell>
                    <TableCell className={adminRefillsCols.patientCell}>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">
                          {contactName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {contactDetail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={adminRefillsCols.productCell}>
                      {sub.product_name || "Product"}
                    </TableCell>
                    <TableCell className={adminRefillsCols.statusCell}>
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
                    <TableCell className={adminRefillsCols.pharmacyCell}>
                      <PharmacyCombobox
                        subscriptionId={sub.id}
                        currentPharmacyId={sub.pharmacy_id}
                        currentPharmacyName={sub.pharmacy?.name}
                        onAssign={handleAssignPharmacy}
                        loading={assigningId === sub.id}
                      />
                    </TableCell>
                    <TableCell className={adminRefillsCols.actionsCell}>
                      <div className="flex items-center gap-2 justify-end">
                        {sub.prescription_document_url && (
                          <Button
                            variant="outline"
                            size="icon"
                            className={actionStyles.iconButton}
                            onClick={() =>
                              loadPrescription(sub.prescription_document_url!)
                            }
                            title="View Document"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {!sub.prescription_verified && (
                          <Button
                            variant="default"
                            size="icon"
                            className={`${actionStyles.iconButton} bg-green-600 hover:bg-green-700`}
                            onClick={() => handleVerify(sub.id, true)}
                            title="Verify"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
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

      <Dialog
        open={!!viewingPrescription}
        onOpenChange={(o) => !o && setViewingPrescription(null)}
        modal={false}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Verification Document</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-50 rounded p-4 flex justify-center items-center min-h-[300px]">
            {prescriptionUrl ? (
              viewingPrescription?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={prescriptionUrl}
                  className="w-full h-[80vh]"
                  title="Document Viewer"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prescriptionUrl}
                  alt="Prescription"
                  className="w-full max-h-[75vh] object-contain"
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
