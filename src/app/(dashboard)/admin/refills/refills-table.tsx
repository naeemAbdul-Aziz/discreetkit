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
  AlertTriangle,
  History,
  Activity,
  ShieldAlert,
  ArrowRight,
  Terminal,
  Zap,
  Clock,
  Shield,
  Loader2
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

// Masking Helper
function maskName(name: string) {
  if (!name || name === "Anonymous") return "P-NODE-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1) + "***";
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

// Pharmacy Combobox
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
            "flex items-center gap-8 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest border-none bg-slate-50 transition-none outline-none group/trigger shadow-sm hover:bg-slate-100",
            currentPharmacyName && "bg-white border-slate-100 border text-slate-900"
          )}
        >
          <Store className="h-5 w-5 shrink-0 text-slate-300 group-hover/trigger:text-brand-teal transition-none" />
          <span className="truncate max-w-[180px]">
            {loading ? "ROUTING..." : currentPharmacyName?.toUpperCase() || "ROUTE_MASTER_NODE"}
          </span>
          <ChevronsUpDown className="ml-4 h-5 w-5 shrink-0 text-slate-200 group-hover/trigger:text-slate-900 transition-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0 rounded-[40px] border-none shadow-2xl overflow-hidden bg-white transition-none z-[100]" align="start">
        <Command shouldFilter={false} className="bg-white">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 backdrop-blur-3xl">
            <div className="relative group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-brand-teal transition-none" />
                <CommandInput
                  placeholder="FILTER_NODE_REGISTRY_MATRIX..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="pl-18 h-16 border-none focus:ring-0 text-[12px] font-black uppercase tracking-[0.3em] bg-transparent text-slate-900"
                />
            </div>
          </div>
          <CommandList className="max-h-[440px] scrollbar-hide bg-white p-4">
            <CommandEmpty className="py-24 text-center text-[12px] font-black uppercase tracking-[0.3em] text-slate-200 px-12 leading-relaxed">
              {searching ? "SYNCHRONIZING_NODES..." : "MATRIX_SCAN_NOMINAL: NO MATCHING NODES DETECTED."}
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
                  className="rounded-[32px] px-8 py-6 text-[12px] font-black uppercase tracking-widest flex items-center justify-between cursor-pointer transition-none aria-selected:bg-slate-900 aria-selected:text-white mb-2 last:mb-0 group/item"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                        "h-12 w-12 rounded-full border-2 flex items-center justify-center transition-none",
                        currentPharmacyId === pharmacy.id ? "bg-brand-teal/10 border-brand-teal text-brand-teal" : "bg-white border-slate-100 text-slate-100 group-hover/item:border-slate-200"
                    )}>
                        <Check className="h-6 w-6" />
                    </div>
                    <span className="truncate max-w-[220px]">{pharmacy.name.toUpperCase()}</span>
                  </div>
                  {pharmacy.recommended && (
                    <div className="bg-emerald-500/10 text-emerald-600 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest border-none shadow-sm">OPTIMAL</div>
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
        toast({ title: "ROUTING_ERROR", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "NODE_ASSIGNED_SYNC", description: `Cycle successfully routed to ${pharmacyName.toUpperCase()}` });
        setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, pharmacy_id: pharmacyId, pharmacy: { name: pharmacyName } } : s));
      }
    } catch (e) {
      toast({ title: "TERMINAL_CRITICAL", description: "Failed to finalize routing sync.", variant: "destructive" });
    } finally {
      setAssigningId(null);
    }
  };

  const handleVerify = async (id: string, isValid: boolean) => {
    const result = await verifyPrescription(id, isValid);
    if (result.error) {
      toast({ title: "VALIDATION_FAILURE", description: result.error, variant: "destructive" });
    } else {
      toast({ title: isValid ? "CREDENTIAL_VALIDATED" : "REQUEST_SUSPENDED_PROTOCOL" });
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
      toast({ title: "ACCESS_DENIED", description: "Protocol storage access restricted.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-16">
      <div className="px-4">
        <ActionBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="PROTOCOL_SEARCH: FILTER_OPERATIONAL_STREAMS..."
            className="h-20 rounded-[32px] font-black text-[12px] uppercase tracking-[0.25em] border-none bg-slate-50/50 placeholder:text-slate-200 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
        />
      </div>

      <div className="overflow-hidden px-2">
        <Table className="min-w-[1500px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[120px] pl-16 py-12">
                <Checkbox 
                  checked={selectedIds.length === filteredSubs.length && filteredSubs.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="rounded-lg h-9 w-9 border-slate-200 bg-white data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none shadow-sm"
                />
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">CYCLE_IDENTITY_MANIFEST</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">NODE_IDENTITY_MASKED</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">SKU_DESIGNATION_PULSE</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12 text-center">OPERATIONAL_STATUS</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">FULFILLMENT_NODE_STATION</TableHead>
              <TableHead className="text-right pr-16 py-12 text-[11px] uppercase tracking-[0.3em] font-black text-slate-400">CONTROL_INTERFACE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.map((sub) => {
              const isUrgent = sub.next_refill_date && isBefore(new Date(sub.next_refill_date), addDays(new Date(), 3));
              
              return (
                <TableRow 
                  key={sub.id} 
                  className={cn(
                    "border-slate-50 group transition-none",
                    selectedIds.includes(sub.id) ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                  )}
                >
                  <TableCell className="pl-16 py-12">
                    <Checkbox 
                      checked={selectedIds.includes(sub.id)}
                      onCheckedChange={() => toggleSelect(sub.id)}
                      className="rounded-lg h-9 w-9 border-slate-200 bg-white data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none shadow-sm"
                    />
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{sub.subscription_code}</span>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none tabular-nums">
                          {sub.next_refill_date ? format(new Date(sub.next_refill_date), "MMM dd, yyyy").toUpperCase() : "PENDING_SYNC_SIGNAL"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex items-center gap-10">
                      <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <ShieldCheck className="h-7 w-7 text-brand-teal" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{maskName(sub.user_name || sub.delivery_address?.name)}</span>
                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">ENCRYPTED_NODE_PROFILE</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-slate-50 border border-slate-100 w-fit shadow-sm">
                      <FlaskConical className="h-5 w-5 text-brand-teal" />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">{sub.product_name?.toUpperCase() || "SPECIALTY_SKU_NODE"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className={cn(
                            "flex items-center gap-4 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-none shadow-sm",
                            sub.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                             <div className={cn("h-2 w-2 rounded-full", sub.status === "active" ? "bg-emerald-500" : "bg-amber-500")} />
                             {sub.status.toUpperCase().replace("_", " ")}
                        </div>
                        {isUrgent && (
                          <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">PRIORITY_STATION_SYNC</span>
                          </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="py-12">
                    <PharmacyCombobox
                      subscriptionId={sub.id}
                      currentPharmacyId={sub.pharmacy_id}
                      currentPharmacyName={sub.pharmacy?.name}
                      onAssign={handleAssignPharmacy}
                      loading={assigningId === sub.id}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-16 py-12">
                    <div className="flex items-center justify-end gap-6">
                      {sub.prescription_document_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-16 w-16 rounded-[24px] bg-slate-50 text-slate-200 hover:text-brand-teal hover:bg-brand-teal/5 transition-none border-none shadow-sm"
                          onClick={() => loadPrescription(sub.prescription_document_url!)}
                        >
                          <FileText className="h-7 w-7" />
                        </Button>
                      )}
                      {!sub.prescription_verified && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-16 w-16 rounded-[24px] bg-slate-50 text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 transition-none border-none shadow-sm"
                          onClick={() => handleVerify(sub.id, true)}
                        >
                          <ShieldCheck className="h-7 w-7" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-16 w-16 rounded-[24px] bg-slate-50 text-slate-200 hover:text-slate-900 transition-none border-none shadow-sm"
                      >
                        <MoreVertical className="h-7 w-7" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredSubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-80 text-center bg-slate-50/20 border-none transition-none">
                  <div className="flex flex-col items-center gap-12">
                      <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <ShieldAlert className="h-20 w-20 text-slate-100" />
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">MATRIX_SCAN_NOMINAL_STATE</h3>
                        <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">No operational refill streams match the current protocol parameters. Synchronize operational parameters to refresh registry lifecycle feed.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="rounded-full h-20 px-20 font-black text-[12px] uppercase tracking-[0.25em] border-slate-100 text-slate-300 hover:bg-slate-900 hover:text-white transition-none gap-6 shadow-2xl shadow-slate-900/5"
                        onClick={() => setSearchTerm("")}
                      >
                        <History className="h-6 w-6" /> RESET_OPERATIONAL_LIFECYCLE_SCAN
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: "BATCH_PROVISION_SIGNAL", onClick: () => {}, icon: <CheckCircle className="h-6 w-6" /> },
          { label: "DECOMMISSION_CYCLE_STATION", onClick: () => {}, icon: <Trash2 className="h-6 w-6" />, variant: "destructive" }
        ]}
      />

      <Dialog
        open={!!viewingPrescription}
        onOpenChange={(o) => !o && setViewingPrescription(null)}
      >
        <DialogContent className="max-w-[1200px] h-[900px] rounded-[48px] border-none shadow-2xl p-0 overflow-hidden flex flex-col bg-white transition-none">
          <div className="p-16 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 backdrop-blur-3xl">
            <div className="flex items-center gap-10">
                <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/30">
                    <Shield className="h-10 w-10 text-brand-teal" />
                </div>
                <div className="space-y-4">
                    <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Clinical_Protocol_Audit</DialogTitle>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.5)]" />
                        <DialogDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Verification & node compliance review audit for operational stream.</DialogDescription>
                    </div>
                </div>
            </div>
            {prescriptionUrl && (
              <Button variant="outline" size="sm" asChild className="rounded-full h-16 px-12 font-black text-[12px] uppercase tracking-widest gap-6 bg-white border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-none border-none">
                <a href={prescriptionUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-6 w-6" /> HIGH_RESOLUTION_MANIFEST
                </a>
              </Button>
            )}
          </div>
          
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden p-16">
            {prescriptionUrl ? (
              viewingPrescription?.toLowerCase().endsWith(".pdf") ? (
                <iframe src={prescriptionUrl} className="w-full h-full rounded-[40px] shadow-2xl" title="Node Asset Viewer" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={prescriptionUrl} alt="Prescription Assets" className="max-w-full max-h-full object-contain rounded-[40px] shadow-2xl" />
              )
            ) : (
              <div className="flex flex-col items-center gap-8">
                <Loader2 className="h-16 w-16 text-brand-teal animate-spin" />
                <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">DECRYPTING_ASSETS_SYNC...</span>
              </div>
            )}
          </div>
          
          <div className="p-16 flex items-center justify-end gap-8 bg-slate-50/30 border-t border-slate-50">
            <Button variant="ghost" onClick={() => setViewingPrescription(null)} className="rounded-full h-20 px-16 text-[12px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-50 transition-none border-none">ABORT_PROTOCOL_REVIEW</Button>
            <Button 
               onClick={() => {
                 const currentSubId = subscriptions.find(s => s.prescription_document_url === viewingPrescription)?.id;
                 if (currentSubId) handleVerify(currentSubId, true);
                 setViewingPrescription(null);
               }}
               className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-20 px-20 font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-brand-teal/40 transition-none border-none gap-8"
            >
              CONFIRM_CLINICAL_COMPLIANCE_SIGNAL
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
