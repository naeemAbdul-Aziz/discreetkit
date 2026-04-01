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
  MoreHorizontal,
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
  activeOrders?: number; // Added for visual signaling
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    if (!confirm("Are you sure you want to delete this partner?")) return;

    const res = await deletePharmacy(id);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      toast({ title: "Deleted", description: "Partner removed." });
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} partners?`)) return;
    // Implementation for bulk delete would go here
    toast({ title: "Bulk Action", description: "Bulk deletion requested." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Partner Network</h1>
          <p className="text-sm text-slate-500 font-medium">Manage pharmacy partners and their operational status.</p>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-brand-indigo hover:bg-brand-indigo/90 shadow-lg shadow-brand-indigo/20 rounded-xl px-6 h-11"
        >
          <Plus className="h-4 w-4 mr-2" />
            Add Partner
        </Button>
      </div>

      <ActionBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by name or location..."
      />

      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox 
                    checked={selectedIds.length === filteredPartners.length && filteredPartners.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Partner</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Contact Details</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Operational Status</TableHead>
                <TableHead className="text-right pr-6 text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow 
                  key={partner.id} 
                  className={cn(
                    "group transition-colors border-slate-100",
                    selectedIds.includes(partner.id) ? "bg-brand-indigo/[0.02]" : "hover:bg-slate-50/50"
                  )}
                >
                  <TableCell className="pl-6">
                    <Checkbox 
                      checked={selectedIds.includes(partner.id)}
                      onCheckedChange={() => toggleSelect(partner.id)}
                      aria-label={`Select ${partner.name}`}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-slate-200 ring-2 ring-white">
                          <AvatarImage src={`https://avatar.vercel.sh/${partner.name}.png`} />
                          <AvatarFallback className="bg-brand-indigo/10 text-brand-indigo font-bold">
                            {partner.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {partner.user_id && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/10" 
                               title="Linked Account" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <Link 
                          href={`/admin/partners/${partner.id}`}
                          className="font-bold text-slate-900 group-hover:text-brand-indigo transition-colors flex items-center gap-1.5"
                        >
                          {partner.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {partner.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {partner.contact_person || "No Contact"}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {partner.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {partner.phone_number}
                          </div>
                        )}
                        {partner.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {partner.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {partner.user ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-lg bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2 py-0.5 gap-1.5">
                          <UserCheck className="h-3 w-3" />
                          Authenticated
                        </Badge>
                        {partner.activeOrders && partner.activeOrders > 0 ? (
                           <div className="flex items-center gap-1.5">
                             <div className="h-2 w-2 rounded-full bg-brand-indigo animate-pulse" />
                             <span className="text-xs font-black text-brand-indigo tabular-nums">{partner.activeOrders} Live</span>
                           </div>
                        ) : (
                          <span className="text-[10px] uppercase tracking-tighter font-black text-slate-300">Idle</span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="rounded-lg bg-slate-50 text-slate-400 border-slate-200 font-bold px-2 py-0.5 gap-1.5">
                        <User className="h-3 w-3" />
                        No Account
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 text-slate-400 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-lg"
                      >
                        <Link href={`/admin/partners/${partner.id}`}>
                          <Package className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-lg"
                        onClick={() => handleEdit(partner)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg">
                             <MoreVertical className="h-3.5 w-3.5" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 rounded-xl">
                           <DropdownMenuItem className="rounded-lg" onClick={() => window.open(`mailto:${partner.email}`)}>
                             Email Partner
                           </DropdownMenuItem>
                           <DropdownMenuItem className="rounded-lg" onClick={() => window.open(`tel:${partner.phone_number}`)}>
                             Call Partner
                           </DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem className="rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={() => handleDelete(partner.id)}>
                             Delete Network Node
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: "Deactivate Node", onClick: handleBulkDelete, icon: <Trash2 className="h-4 w-4" />, variant: "destructive" }
        ]}
      />

      <PartnerSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        partner={selectedPartner}
      />
    </div>
  );
}

