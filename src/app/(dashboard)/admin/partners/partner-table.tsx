"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit,
  MapPin,
  Phone,
  User,
  UserCheck,
  Package,
  ExternalLink,
  Mail,
  MoreVertical,
  Activity,
  ShieldCheck,
  Network,
  AlertTriangle,
  Terminal,
  Zap,
  Activity as ActivityIcon,
  ShieldAlert,
  ArrowRight,
  Shield,
  History,
  XCircle,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActionBar } from "@/components/dashboard/action-bar";
import { BulkActionsBar } from "@/components/dashboard/bulk-actions-bar";
import { PartnerSheet } from "./partner-sheet";
import { deletePharmacy } from "@/lib/admin-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Pharmacy {
  id: number;
  name: string;
  location: string;
  contact_person: string | null;
  phone_number: string | null;
  email: string | null;
  user_id?: string | null;
  user?: { id: string; email: string } | null;
  activeOrders?: number;
}

export function PartnerTable({
  initialPartners,
}: {
  initialPartners: Pharmacy[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Pharmacy | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filteredPartners = initialPartners.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPartners.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPartners.map(p => p.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleEdit = (partner: Pharmacy) => {
    setSelectedPartner(partner);
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setSelectedPartner(null);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirm termination of this operational node? Network integrity will be recalculated.")) return;

    const res = await deletePharmacy(id);
    if (res.error) {
      toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error });
    } else {
      toast({ title: "SKU_DECOMMISSIONED", description: "Operational partner removed from active registry." });
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Confirm termination of ${selectedIds.length} operational nodes?`)) return;
    toast({ title: "BATCH_ACTION_SYNC", description: "Mass termination protocol initiated across selected nodes." });
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 px-4">
        <div className="flex items-center gap-10">
            <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/30 transition-transform duration-500 hover:scale-110">
                <Network className="h-10 w-10 text-brand-teal" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">NODE_REGISTRY_MATRIX</h2>
              <div className="flex items-center gap-6">
                  <div className="h-1.5 w-12 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Operational directory of registered fulfillment terminals across matrix</p>
              </div>
            </div>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[12px] uppercase tracking-[0.3em] px-16 rounded-full h-20 transition-none border-none shadow-2xl shadow-slate-900/40 gap-8 group"
        >
          <Plus className="h-6 w-6 text-brand-teal group-hover:rotate-90 transition-transform duration-300" />
          PROVISION_NEW_STATION
          <ArrowRight className="h-6 w-6 text-brand-teal group-hover:translate-x-2 transition-transform duration-300" />
        </Button>
      </div>

      <div className="px-4">
        <ActionBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="PROTOCOL_SEARCH: FILTER_NETWORK_TERMINAL_STATIONS..."
            className="h-20 rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] border-none bg-slate-50/50 placeholder:text-slate-200 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
        />
      </div>

      <div className="overflow-hidden">
          <Table className="min-w-[1500px]">
            <TableHeader className="bg-slate-50/30 border-b border-slate-50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[120px] pl-16 py-12">
                  <Checkbox 
                    checked={selectedIds.length === filteredPartners.length && filteredPartners.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="rounded-lg h-9 w-9 border-slate-200 bg-white data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none shadow-sm"
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">STATION_IDENTITY_MATRIX</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">OPERATIONAL_LEAD_SYNC</TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">STATION_STATUS_PULSE</TableHead>
                <TableHead className="text-right pr-16 text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 py-12">CONTROL_TERMINAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow 
                  key={partner.id} 
                  className={cn(
                    "group border-slate-50 transition-none",
                    selectedIds.includes(partner.id) ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                  )}
                >
                  <TableCell className="pl-16 py-12">
                    <Checkbox 
                      checked={selectedIds.includes(partner.id)}
                      onCheckedChange={() => toggleSelect(partner.id)}
                      className="rounded-lg h-9 w-9 border-slate-200 bg-white data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none shadow-sm"
                    />
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex items-center gap-12">
                      <Avatar className="h-20 w-20 rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 transition-none group-hover:scale-105 duration-500">
                        <AvatarImage src={`https://avatar.vercel.sh/${partner.name}.png`} />
                        <AvatarFallback className="bg-slate-50 text-slate-200 font-black text-[14px] uppercase tracking-widest">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-4">
                        <Link 
                          href={`/admin/partners/${partner.id}`}
                          className="font-black text-slate-900 hover:text-brand-teal flex items-center gap-8 uppercase tracking-tight text-lg transition-none leading-none group/title"
                        >
                          {partner.name.toUpperCase()}
                          <Terminal className="h-7 w-7 text-slate-50 group-hover/title:text-brand-teal transition-none" />
                        </Link>
                        <div className="h-12 px-8 rounded-full bg-slate-50/50 border border-slate-100 flex items-center gap-6 shadow-sm w-fit group-hover:bg-slate-900 transition-colors duration-500">
                          <MapPin className="h-4 w-4 text-slate-200 group-hover:text-brand-teal" />
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none group-hover:text-white transition-none">{partner.location.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-6 text-base font-black text-slate-900 uppercase tracking-widest leading-none">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors duration-500">
                            <User className="h-6 w-6 text-slate-200 group-hover:text-brand-teal transition-colors" />
                        </div>
                        {partner.contact_person ? partner.contact_person.toUpperCase() : "PROTOCOL_UNASSIGNED_STATION"}
                      </div>
                      <div className="flex items-center gap-16 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none pl-18">
                        {partner.phone_number && (
                          <div className="flex items-center gap-6">
                            <Phone className="h-4 w-4 text-slate-100" /> {partner.phone_number}
                          </div>
                        )}
                        {partner.email && (
                          <div className="flex items-center gap-6">
                            <Mail className="h-4 w-4 text-slate-100" /> {partner.email.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex items-center gap-16">
                      {partner.user ? (
                        <div className="flex items-center gap-6 px-10 py-3.5 rounded-full bg-emerald-500/10 shadow-sm transition-none border-none">
                            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em]">NODE_VALIDATED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-6 px-10 py-3.5 rounded-full bg-rose-500/10 shadow-sm transition-none border-none">
                            <div className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />
                            <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">PENDING_LINK</span>
                        </div>
                      )}
                      
                      {partner.activeOrders && partner.activeOrders > 0 ? (
                          <div className="flex items-center gap-8 px-10 py-4 rounded-full bg-slate-900 shadow-2xl shadow-slate-900/40">
                            <ActivityIcon className="h-6 w-6 text-brand-teal" />
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] tabular-nums">{partner.activeOrders} CYCLES_ACTIVE</span>
                          </div>
                      ) : (
                        <div className="flex items-center gap-10">
                             <div className="h-1.5 w-12 bg-slate-50 rounded-full" />
                             <span className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] leading-none">STATION_NOMINAL_IDLE</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-16 py-12">
                    <div className="flex items-center justify-end gap-10 opacity-0 group-hover:opacity-100 transition-none">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-16 w-16 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-none border-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/10"
                      >
                        <Link href={`/admin/partners/${partner.id}`}>
                          <Package className="h-8 w-8" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-16 w-16 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-none border-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/10"
                        onClick={() => handleEdit(partner)}
                      >
                        <Edit className="h-8 w-8" />
                      </Button>
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-16 w-16 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-none border-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/10">
                             <MoreVertical className="h-8 w-8" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-[480px] rounded-[48px] border-none shadow-2xl p-10 bg-white transition-none">
                           <DropdownMenuLabel className="text-[13px] font-black uppercase tracking-[0.4em] text-slate-400 px-8 py-10 border-b border-slate-50 mb-6 flex items-center gap-8">
                             <Terminal className="h-6 w-6 text-slate-200" />
                             TERMINAL_CONTROL_MATRIX
                           </DropdownMenuLabel>
                           <div className="space-y-4">
                               <DropdownMenuItem className="h-20 text-[13px] font-black uppercase tracking-[0.3em] px-12 rounded-[32px] transition-none cursor-pointer focus:bg-slate-50 focus:text-slate-900 flex items-center gap-8" onClick={() => window.open(`mailto:${partner.email}`)}>
                                 <Mail className="h-7 w-7 text-slate-200" />
                                 Email_Dispatch_Protocol
                               </DropdownMenuItem>
                               <DropdownMenuItem className="h-20 text-[13px] font-black uppercase tracking-[0.3em] px-12 rounded-[32px] transition-none cursor-pointer focus:bg-slate-50 focus:text-slate-900 flex items-center gap-8" onClick={() => window.open(`tel:${partner.phone_number}`)}>
                                 <Phone className="h-7 w-7 text-slate-200" />
                                 Operational_Uplink_Call
                               </DropdownMenuItem>
                           </div>
                           <DropdownMenuSeparator className="bg-slate-50 my-8 mx-4" />
                           <div className="">
                               <DropdownMenuItem className="h-20 text-[13px] font-black uppercase tracking-[0.3em] px-12 rounded-[32px] transition-none cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 flex items-center gap-8" onClick={() => handleDelete(partner.id)}>
                                 <Trash2 className="h-7 w-7 text-rose-300" />
                                 Terminate_Node_Protocol
                               </DropdownMenuItem>
                           </div>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPartners.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="py-80 text-center bg-transparent border-none transition-none">
                        <div className="flex flex-col items-center gap-12">
                            <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                                <Network className="h-20 w-20 text-slate-100" />
                            </div>
                            <div className="space-y-8 text-center">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.5em] leading-none">Registry Nominal State</h3>
                                <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
                                    No operational nodes matching protocol search parameters. Synchronize network telemetry to refresh global registry feed.
                                </p>
                            </div>
                            <Button 
                              variant="outline" 
                              className="rounded-full h-20 px-24 font-black text-[13px] uppercase tracking-[0.4em] border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none gap-8 shadow-2xl shadow-slate-900/5 group"
                              onClick={() => setSearchTerm("")}
                            >
                              <History className="h-7 w-7 group-hover:rotate-180 transition-transform duration-500" /> RESET_NETWORK_SCAN
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
          { label: "BATCH_TERMINATE_SIGNAL", onClick: handleBulkDelete, icon: <Trash2 className="h-7 w-7" />, variant: "destructive" }
        ]}
      />

      <PartnerSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        partner={selectedPartner}
      />

      {/* Sync Alert */}
      <div className="pt-16 border-t border-slate-50 flex items-center gap-10 px-8">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-sm border border-emerald-500/20">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Operational node registry synchronized with master logistics matrix protocol terminal.</p>
      </div>
    </div>
  );
}
