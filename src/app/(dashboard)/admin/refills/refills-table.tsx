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
  User,
  ShieldCheck,
  Calendar,
  MoreVertical,
  FlaskConical,
  Search,
  Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ActionBar } from "@/components/dashboard/action-bar";
import { BulkActionsBar } from "@/components/dashboard/bulk-actions-bar";
import { useToast } from "@/hooks/use-toast";
import {
  assignPharmacyToSubscription,
  verifyPrescription,
  searchPharmacies,
} from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";

// Masking Helper: "Kofi Mensah" -> "K. Mensah"
function maskName(name: string) {
  if (!name || name === "Anonymous") return "P-ID-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1) + "***";
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

// Minimalists Pharmacy Combobox
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

  useEffect(() => {
    const fetchInitial = async () => {
      if (!open) return;
      setSearching(true);
      const data = await searchPharmacies("");
      setPharmacies(data);
      setSearching(false);
    };
    fetchInitial();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      const data = await searchPharmacies(searchQuery);
      setPharmacies(data);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent",
            currentPharmacyName 
              ? "bg-slate-50 text-slate-700 hover:border-slate-200" 
              : "bg-brand-indigo/5 text-brand-indigo hover:bg-brand-indigo/10 border-dashed border-brand-indigo/20",
            loading && "opacity-50 cursor-wait"
          )}
        >
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span className="max-w-[100px] truncate">
            {loading ? "Syncing..." : currentPharmacyName || "Assign Partner"}
          </span>
          <ChevronsUpDown className="h-3 w-3 opacity-30" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 rounded-xl shadow-2xl border-slate-200 overflow-hidden" align="start">
        <Command shouldFilter={false}>
          <div className="p-2 border-b border-slate-100">
            <CommandInput
              placeholder="Search partner network..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9 border-none focus:ring-0 text-sm"
            />
          </div>
          <CommandList className="max-h-[250px]">
            <CommandEmpty className="py-6 text-center text-xs text-slate-400">
              {searching ? "Probing network..." : "No matches found."}
            </CommandEmpty>
            <CommandGroup className="p-1">
              {pharmacies.map((pharmacy) => (
                <CommandItem
                  key={pharmacy.id}
                  value={pharmacy.name}
                  onSelect={() => {
                    onAssign(subscriptionId, pharmacy.id, pharmacy.name);
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-2 text-sm flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      currentPharmacyId === pharmacy.id ? "bg-brand-indigo" : "bg-slate-200"
                    )} />
                    <span className="font-semibold text-slate-700">{pharmacy.name}</span>
                  </div>
                  {pharmacy.recommended && (
                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black h-4 px-1 uppercase tracking-tighter">
                      Optimum
                    </Badge>
                  )}
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
}: {
  initialSubscriptions: any[];
}) {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<string | null>(null);

  const filteredSubs = (subscriptions || []).filter(s => 
    (s.subscription_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.product_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSubs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredSubs.map(s => s.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleAssignPharmacy = async (subId: string, pharmacyId: number, pharmacyName: string) => {
    setAssigningId(subId);
    try {
      const result = await assignPharmacyToSubscription(subId, pharmacyId);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Partner Assigned", description: `Route successfully mapped to ${pharmacyName}` });
        setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, pharmacy_id: pharmacyId, pharmacy: { name: pharmacyName } } : s));
      }
    } catch (e) {
      toast({ title: "Network Error", description: "Failed to update partner.", variant: "destructive" });
    } finally {
      setAssigningId(null);
    }
  };

  const handleVerify = async (id: string, isValid: boolean) => {
    const result = await verifyPrescription(id, isValid);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: isValid ? "Document Validated" : "Request Declined" });
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, prescription_verified: isValid, status: isValid && s.status === "pending_verification" ? "active" : s.status } : s));
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
      toast({ title: "Error", description: "Storage access denied.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">


      <ActionBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by code or product..."
      />

      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox 
                    checked={selectedIds.length === filteredSubs.length && filteredSubs.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Subscription</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Patient (Masked)</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Product</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Status & Health</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Fulfillment Partner</TableHead>
                <TableHead className="text-right pr-6 text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub) => {
                const isUrgent = sub.next_refill_date && isBefore(new Date(sub.next_refill_date), addDays(new Date(), 3));
                
                return (
                  <TableRow 
                    key={sub.id} 
                    className={cn(
                      "group transition-colors border-slate-100",
                      selectedIds.includes(sub.id) ? "bg-brand-indigo/[0.02]" : "hover:bg-slate-50/50"
                    )}
                  >
                    <TableCell className="pl-6">
                      <Checkbox 
                        checked={selectedIds.includes(sub.id)}
                        onCheckedChange={() => toggleSelect(sub.id)}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-400 tabular-nums uppercase tracking-tighter">{sub.subscription_code}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {sub.next_refill_date ? format(new Date(sub.next_refill_date), "MMM d, yyyy") : "Interval Pending"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <ShieldCheck className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 leading-tight">{maskName(sub.user_name || sub.delivery_address?.name)}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Protected Identifier</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-3.5 w-3.5 text-brand-indigo" />
                        <span className="text-sm font-bold text-slate-700">{sub.product_name || "Specialty Item"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-lg font-bold px-2 py-0.5 uppercase text-[10px] tracking-tight",
                            sub.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            sub.status === "pending_verification" ? "bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                          )}
                        >
                          {sub.status.replace("_", " ")}
                        </Badge>
                        {isUrgent && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-[10px] font-black text-rose-600 uppercase">Priority</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <PharmacyCombobox
                        subscriptionId={sub.id}
                        currentPharmacyId={sub.pharmacy_id}
                        currentPharmacyName={sub.pharmacy?.name}
                        onAssign={handleAssignPharmacy}
                        loading={assigningId === sub.id}
                      />
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {sub.prescription_document_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-lg"
                            onClick={() => loadPrescription(sub.prescription_document_url!)}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!sub.prescription_verified && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            onClick={() => handleVerify(sub.id, true)}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredSubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">No refill records found</p>
                        <p className="text-xs text-slate-500">Filters generated 0 results. Try a broader search.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: "Approve Bulk", onClick: () => {}, icon: <CheckCircle className="h-4 w-4" /> },
          { label: "Cancel Selected", onClick: () => {}, icon: <Trash2 className="h-4 w-4" />, variant: "destructive" }
        ]}
      />

      <Dialog
        open={!!viewingPrescription}
        onOpenChange={(o) => !o && setViewingPrescription(null)}
      >
        <DialogContent className="max-w-4xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <DialogTitle className="text-xl font-black">Clinical Document</DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verification & Compliance Review</DialogDescription>
            </div>
            {prescriptionUrl && (
              <Button variant="outline" size="sm" asChild className="rounded-xl font-bold gap-2 bg-white">
                <a href={prescriptionUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Full Resolution
                </a>
              </Button>
            )}
          </div>
          
          <div className="aspect-[4/3] bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {prescriptionUrl ? (
              viewingPrescription?.toLowerCase().endsWith(".pdf") ? (
                <iframe src={prescriptionUrl} className="w-full h-full" title="Document Viewer" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={prescriptionUrl} alt="Prescription" className="max-w-full max-h-full object-contain" />
              )
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-500">Decrypting assets...</span>
              </div>
            )}
          </div>
          
          <div className="p-6 flex items-center justify-end gap-3 bg-slate-50/30">
            <Button variant="ghost" onClick={() => setViewingPrescription(null)} className="rounded-xl font-bold">Close Preview</Button>
            <Button 
               onClick={() => {
                 const currentSubId = subscriptions.find(s => s.prescription_document_url === viewingPrescription)?.id;
                 if (currentSubId) handleVerify(currentSubId, true);
                 setViewingPrescription(null);
               }}
               className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-emerald-600/20"
            >
              Approve Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

