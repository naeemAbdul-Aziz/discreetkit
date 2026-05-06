"use client";

import { useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Check, 
    X, 
    MapPin, 
    Clock, 
    GanttChartSquare,
    Loader2,
    ShieldCheck,
    Zap,
    Terminal,
    Activity,
    Repeat,
    ShieldAlert,
    Info,
    ArrowRight
} from "lucide-react";
import { 
    updateServiceArea, 
    removeServiceArea, 
    toggleServiceAreaStatus,
    addServiceArea
} from "@/lib/pharmacy-actions";
import { useToast } from "@/hooks/use-toast";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { discounts } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceArea {
    id: number;
    area_name: string;
    delivery_fee: number;
    max_delivery_time_hours: number;
    is_active: boolean;
}

interface ServiceAreaMatrixProps {
    initialAreas: ServiceArea[];
}

export function ServiceAreaMatrix({ initialAreas }: ServiceAreaMatrixProps) {
    const { toast } = useToast();
    const [areas, setAreas] = useState(initialAreas);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<ServiceArea>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        areaName: "",
        deliveryFee: "10.00",
        maxDeliveryTime: "4"
    });
    const [loading, setLoading] = useState<number | string | null>(null);

    const handleToggle = async (id: number, currentStatus: boolean) => {
        setLoading(id);
        const res = await toggleServiceAreaStatus(id, currentStatus);
        if (res.success) {
            setAreas(areas.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
            toast({ title: !currentStatus ? "ZONE_ACTIVATED" : "ZONE_DEACTIVATED" });
        } else {
            toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error });
        }
        setLoading(null);
    };

    const handleEdit = (area: ServiceArea) => {
        setEditingId(area.id);
        setEditData({ 
            delivery_fee: area.delivery_fee, 
            max_delivery_time_hours: area.max_delivery_time_hours 
        });
    };

    const handleSave = async (id: number) => {
        setLoading(id);
        const res = await updateServiceArea(id, editData);
        if (res.success) {
            setAreas(areas.map(a => a.id === id ? { ...a, ...editData } as ServiceArea : a));
            setEditingId(null);
            toast({ title: "MATRIX_SYNCHRONIZED" });
        } else {
            toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error });
        }
        setLoading(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Confirm decommissioning of this logistics sector?")) return;
        setLoading(id);
        const res = await removeServiceArea(id);
        if (res.success) {
            setAreas(areas.filter(a => a.id !== id));
            toast({ title: "SECTOR_REMOVED" });
        }
        setLoading(null);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading("adding");
        const formData = new FormData();
        formData.append("areaName", newData.areaName);
        formData.append("deliveryFee", newData.deliveryFee);
        formData.append("maxDeliveryTime", newData.maxDeliveryTime);

        const res = await addServiceArea(null, formData);
        if (res.success) {
            toast({ title: "ZONE_PROVISIONED" });
            window.location.reload(); 
        } else {
            toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.message });
            setLoading(null);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Logistics_Matrix_Registry</h3>
                </div>
                <Button 
                    onClick={() => setIsAdding(!isAdding)}
                    className={cn(
                        "h-12 px-8 rounded-full font-black text-[10px] uppercase tracking-widest gap-4 transition-none border-none shadow-sm",
                        isAdding ? "bg-rose-50 text-rose-500 hover:bg-rose-100" : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                >
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 text-brand-teal" />}
                    {isAdding ? "Cancel_Provisioning" : "Provision_New_Zone"}
                </Button>
            </div>

            <div className="overflow-hidden">
                <Table className="min-w-[800px]">
                    <TableHeader className="bg-slate-50/30 border-b border-slate-50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[40%] text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-8 pl-12">SERVICE_SECTOR</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-8">DISPATCH_FEE_(GHS)</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-8">MAX_FULFILLMENT_TIME</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-8">SYNC_STATUS</TableHead>
                            <TableHead className="text-right pr-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Inline Add Row */}
                        {isAdding && (
                            <TableRow className="bg-brand-teal/5 border-b border-brand-teal/10 animate-none">
                                <TableCell className="pl-12 py-8">
                                    <Select 
                                        onValueChange={(val) => setNewData({ ...newData, areaName: val })}
                                        defaultValue={newData.areaName}
                                    >
                                        <SelectTrigger className="h-14 bg-white border-none rounded-2xl font-black text-[11px] uppercase tracking-widest px-6 shadow-sm focus:ring-0 transition-none">
                                            <SelectValue placeholder="SELECT_SECTOR_IDENTITY" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-3xl shadow-2xl border-none p-3 bg-white transition-none">
                                            {discounts.map((area) => (
                                                <SelectItem key={area.id} value={area.campus} className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">{area.campus.toUpperCase()}</SelectItem>
                                            ))}
                                            <SelectItem value="Other" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">CUSTOM_SECTOR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="py-8">
                                    <Input 
                                        type="number" 
                                        className="h-14 bg-white border-none rounded-2xl font-black text-[11px] uppercase tracking-widest px-6 shadow-sm focus-visible:ring-0 transition-none tabular-nums"
                                        value={newData.deliveryFee}
                                        onChange={(e) => setNewData({ ...newData, deliveryFee: e.target.value })}
                                    />
                                </TableCell>
                                <TableCell className="py-8">
                                    <Select 
                                        onValueChange={(val) => setNewData({ ...newData, maxDeliveryTime: val })}
                                        defaultValue={newData.maxDeliveryTime}
                                    >
                                        <SelectTrigger className="h-14 bg-white border-none rounded-2xl font-black text-[11px] uppercase tracking-widest px-6 shadow-sm focus:ring-0 transition-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-3xl shadow-2xl border-none p-3 bg-white transition-none">
                                            <SelectItem value="2" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">02_HOURS</SelectItem>
                                            <SelectItem value="4" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">04_HOURS</SelectItem>
                                            <SelectItem value="12" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">12_HOURS</SelectItem>
                                            <SelectItem value="24" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">24_HOURS_(SAME_DAY)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="py-8">
                                    <div className="px-5 py-2 rounded-full bg-white text-brand-teal border border-brand-teal/20 text-[9px] font-black uppercase tracking-widest shadow-sm">AUTO_ACTIVE</div>
                                </TableCell>
                                <TableCell className="text-right pr-12 py-8">
                                    <Button 
                                        onClick={handleAdd}
                                        disabled={loading === "adding"}
                                        className="bg-slate-900 hover:bg-slate-800 text-white h-14 px-10 rounded-full font-black text-[10px] uppercase tracking-widest gap-4 shadow-2xl shadow-slate-900/10 transition-none border-none"
                                    >
                                        {loading === "adding" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-brand-teal" />}
                                        CONFIRM
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Existing Areas */}
                        {areas.length === 0 && !isAdding ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-60 text-center">
                                    <div className="flex flex-col items-center justify-center gap-10">
                                        <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5">
                                            <MapPin className="h-16 w-16 text-slate-100" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Logistics Registry Nominal</h3>
                                            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] max-w-md mx-auto leading-relaxed">
                                                No service sectors or delivery zones defined in the current node registry.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            areas.map((area) => {
                                const isEditing = editingId === area.id;
                                const isPending = loading === area.id;

                                return (
                                    <TableRow key={area.id} className="group hover:bg-slate-50/30 transition-none border-slate-50">
                                        <TableCell className="pl-12 py-10">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-none shadow-sm",
                                                    area.is_active ? "bg-slate-900 text-brand-teal shadow-slate-900/10" : "bg-slate-50 text-slate-200 border border-slate-100"
                                                )}>
                                                    <MapPin className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className={cn("text-base font-black uppercase tracking-tight leading-none", !area.is_active && "text-slate-300 line-through")}>{area.area_name}</p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">REGIONAL_CAMPUS_NODE</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-10">
                                            {isEditing ? (
                                                <Input 
                                                    type="number" 
                                                    className="h-12 w-32 bg-slate-50/50 border-none rounded-xl font-black text-[13px] tracking-tighter tabular-nums px-4 focus-visible:ring-0 shadow-sm transition-none"
                                                    value={editData.delivery_fee}
                                                    onChange={(e) => setEditData({ ...editData, delivery_fee: Number(e.target.value) })}
                                                />
                                            ) : (
                                                <span className="text-lg font-black tabular-nums text-slate-900 tracking-tighter leading-none">₵{Number(area.delivery_fee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-10">
                                            {isEditing ? (
                                                <Select 
                                                    onValueChange={(val) => setEditData({ ...editData, max_delivery_time_hours: Number(val) })}
                                                    defaultValue={String(area.max_delivery_time_hours)}
                                                >
                                                    <SelectTrigger className="h-12 w-40 bg-slate-50/50 border-none rounded-xl font-black text-[11px] uppercase tracking-widest px-4 focus:ring-0 shadow-sm transition-none">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-3xl shadow-2xl border-none p-3 bg-white transition-none">
                                                        <SelectItem value="2" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">02_HOURS</SelectItem>
                                                        <SelectItem value="4" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">04_HOURS</SelectItem>
                                                        <SelectItem value="12" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">12_HOURS</SelectItem>
                                                        <SelectItem value="24" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">24_HOURS</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="h-10 px-5 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-3 shadow-sm w-fit">
                                                    <Clock className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-500">{area.max_delivery_time_hours}H_MAX</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-10">
                                            <div className="flex flex-col items-start gap-2">
                                                <Switch 
                                                    checked={area.is_active}
                                                    onCheckedChange={() => handleToggle(area.id, area.is_active)}
                                                    disabled={isPending}
                                                    className="data-[state=checked]:bg-brand-teal transition-none"
                                                />
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest leading-none",
                                                    area.is_active ? "text-emerald-500" : "text-slate-300"
                                                )}>
                                                    {area.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-12 py-10">
                                            <div className="flex items-center justify-end gap-3 transition-none">
                                                {isEditing ? (
                                                    <>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-12 w-12 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-none"
                                                            onClick={() => handleSave(area.id)}
                                                            disabled={isPending}
                                                        >
                                                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-12 w-12 text-slate-200 hover:text-slate-400 hover:bg-slate-50 rounded-xl transition-none"
                                                            onClick={() => setEditingId(null)}
                                                            disabled={isPending}
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-12 w-12 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-none"
                                                            onClick={() => handleEdit(area)}
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-12 w-12 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-none"
                                                            onClick={() => handleDelete(area.id)}
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Sync Alert */}
            <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                <ShieldCheck className="h-5 w-5 text-brand-teal" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Logistics matrix registry is synchronized with master operational terminal.</p>
            </div>
        </div>
    );
}
