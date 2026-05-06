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
    Loader2
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
            toast({ title: "Status Updated" });
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error });
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
            toast({ title: "Changes Saved" });
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error });
        }
        setLoading(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        setLoading(id);
        const res = await removeServiceArea(id);
        if (res.success) {
            setAreas(areas.filter(a => a.id !== id));
            toast({ title: "Area Removed" });
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
            // Simplistic reload since we don't have the new ID here easily from server action
            window.location.reload(); 
        } else {
            toast({ variant: "destructive", title: "Error", description: res.message });
            setLoading(null);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Delivery Zones</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your active service zones and fees.</p>
                </div>
                <Button 
                    size="sm" 
                    variant={isAdding ? "ghost" : "default"}
                    onClick={() => setIsAdding(!isAdding)}
                    className="h-8 gap-2"
                >
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAdding ? "Cancel" : "Add New Area"}
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-[40%] text-[11px] font-bold uppercase text-slate-400 pl-6">Service Zone</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-400">Fee (GHS)</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-400">Max Time</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-400">Status</TableHead>
                            <TableHead className="text-right pr-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Inline Add Row */}
                        {isAdding && (
                            <TableRow className="bg-brand-teal/5 border-b-2 border-brand-teal/20 animate-in fade-in slide-in-from-top-1 duration-200">
                                <TableCell className="pl-6">
                                    <Select 
                                        onValueChange={(val) => setNewData({ ...newData, areaName: val })}
                                        defaultValue={newData.areaName}
                                    >
                                        <SelectTrigger className="h-9 bg-white border-brand-teal/30 focus:ring-brand-teal">
                                            <SelectValue placeholder="Where do you deliver?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {discounts.map((area) => (
                                                <SelectItem key={area.id} value={area.campus}>{area.campus}</SelectItem>
                                            ))}
                                            <SelectItem value="Other">Custom Area</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="h-9 bg-white border-brand-teal/30 focus:ring-brand-teal"
                                        value={newData.deliveryFee}
                                        onChange={(e) => setNewData({ ...newData, deliveryFee: e.target.value })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select 
                                        onValueChange={(val) => setNewData({ ...newData, maxDeliveryTime: val })}
                                        defaultValue={newData.maxDeliveryTime}
                                    >
                                        <SelectTrigger className="h-9 bg-white border-brand-teal/30 focus:ring-brand-teal">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 Hours</SelectItem>
                                            <SelectItem value="4">4 Hours</SelectItem>
                                            <SelectItem value="12">12 Hours</SelectItem>
                                            <SelectItem value="24">Same Day / 24h</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-white text-brand-teal border-brand-teal/30">Auto-Active</Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button 
                                        size="sm" 
                                        onClick={handleAdd}
                                        disabled={loading === "adding"}
                                        className="bg-brand-teal hover:bg-brand-teal-dark h-8 px-4"
                                    >
                                        {loading === "adding" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Existing Areas */}
                        {areas.length === 0 && !isAdding ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-medium">No service areas defined.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            areas.map((area) => {
                                const isEditing = editingId === area.id;
                                const isPending = loading === area.id;

                                return (
                                    <TableRow key={area.id} className="group hover:bg-slate-50 transition-colors border-slate-100">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                    area.is_active ? "bg-slate-100 group-hover:bg-white" : "bg-slate-50 opacity-50"
                                                )}>
                                                    <MapPin className={cn("h-4 w-4", area.is_active ? "text-slate-600" : "text-slate-400")} />
                                                </div>
                                                <div>
                                                    <p className={cn("text-[13px] font-bold", !area.is_active && "text-slate-400 line-through")}>{area.area_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">Main Campus / Neighborhood</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input 
                                                    type="number" 
                                                    className="h-8 w-24 text-[13px] font-bold tabular-nums"
                                                    value={editData.delivery_fee}
                                                    onChange={(e) => setEditData({ ...editData, delivery_fee: Number(e.target.value) })}
                                                />
                                            ) : (
                                                <span className="text-[13px] font-bold tabular-nums text-slate-700">₵{Number(area.delivery_fee).toFixed(2)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Select 
                                                    onValueChange={(val) => setEditData({ ...editData, max_delivery_time_hours: Number(val) })}
                                                    defaultValue={String(area.max_delivery_time_hours)}
                                                >
                                                    <SelectTrigger className="h-8 w-32 border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="2">2 Hours</SelectItem>
                                                        <SelectItem value="4">4 Hours</SelectItem>
                                                        <SelectItem value="12">12 Hours</SelectItem>
                                                        <SelectItem value="24">24 Hours</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    <span className="text-[12px] font-medium">{area.max_delivery_time_hours}h max</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch 
                                                checked={area.is_active}
                                                onCheckedChange={() => handleToggle(area.id, area.is_active)}
                                                disabled={isPending}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isEditing ? (
                                                    <>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleSave(area.id)}
                                                            disabled={isPending}
                                                        >
                                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-slate-400 hover:bg-slate-50"
                                                            onClick={() => setEditingId(null)}
                                                            disabled={isPending}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-slate-400 hover:bg-slate-100"
                                                            onClick={() => handleEdit(area)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-rose-400 hover:bg-rose-50"
                                                            onClick={() => handleDelete(area.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
