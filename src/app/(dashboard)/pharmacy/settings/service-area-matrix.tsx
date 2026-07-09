"use client";

import { useState, useEffect } from "react";
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
import { Icon } from "@/components/ui/icon";
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
    onUpdate?: () => void;
}

export function ServiceAreaMatrix({ initialAreas, onUpdate }: ServiceAreaMatrixProps) {
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

    // Keep state in sync with parent props when refetched
    useEffect(() => {
        setAreas(initialAreas);
    }, [initialAreas]);

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
            toast({ title: "Area Added Successfully" });
            setIsAdding(false);
            setNewData({ areaName: "", deliveryFee: "10.00", maxDeliveryTime: "4" });
            onUpdate?.(); // Trigger parent reload
        } else {
            toast({ variant: "destructive", title: "Error", description: res.message });
        }
        setLoading(null);
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
                    {isAdding ? <Icon name="close" opticalSize={16} /> : <Icon name="add" opticalSize={16} />}
                    {isAdding ? "Cancel" : "Add Zone"}
                </Button>
            </div>

            {/* Add form - shown on top for both mobile and desktop */}
            {isAdding && (
                <div className="p-4 border-b border-brand-teal/20 bg-brand-teal/5 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-brand-teal">New Delivery Zone</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select 
                            onValueChange={(val) => setNewData({ ...newData, areaName: val })}
                            defaultValue={newData.areaName}
                        >
                            <SelectTrigger className="h-9 bg-white border-brand-teal/30 focus:ring-brand-teal">
                                <SelectValue placeholder="Select area..." />
                            </SelectTrigger>
                            <SelectContent>
                                {discounts.map((area) => (
                                    <SelectItem key={area.id} value={area.campus}>{area.campus}</SelectItem>
                                ))}
                                <SelectItem value="Other">Custom Area</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input 
                            type="number" 
                            placeholder="Fee (GHS)"
                            className="h-9 bg-white border-brand-teal/30 focus:ring-brand-teal"
                            value={newData.deliveryFee}
                            onChange={(e) => setNewData({ ...newData, deliveryFee: e.target.value })}
                        />
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
                    </div>
                    <Button 
                        size="sm" 
                        onClick={handleAdd}
                        disabled={loading === "adding"}
                        className="bg-brand-teal hover:bg-brand-teal-dark h-9 px-6 w-full sm:w-auto"
                    >
                        {loading === "adding" ? <Icon name="progress_activity" className="animate-spin" opticalSize={16} /> : "Confirm Zone"}
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {areas.length === 0 && !isAdding && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Icon name="location_on" opticalSize={32} className="opacity-20" />
                    <p className="text-xs font-medium">No service areas defined.</p>
                </div>
            )}

            {/* Mobile card list (hidden on md+) */}
            {areas.length > 0 && (
                <div className="md:hidden divide-y divide-slate-100">
                    {areas.map((area) => {
                        const isEditing = editingId === area.id;
                        const isPending = loading === area.id;
                        return (
                            <div key={area.id} className={cn("p-4 space-y-3", !area.is_active && "opacity-60")}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <Icon name="location_on" className="text-slate-600" opticalSize={16} />
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-bold", !area.is_active && "line-through text-slate-400")}>{area.area_name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Delivery Zone</p>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={area.is_active}
                                        onCheckedChange={() => handleToggle(area.id, area.is_active)}
                                        disabled={isPending}
                                    />
                                </div>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Fee (GHS)</p>
                                            <Input 
                                                type="number" 
                                                className="h-9 text-sm font-bold"
                                                value={editData.delivery_fee}
                                                onChange={(e) => setEditData({ ...editData, delivery_fee: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Max Time</p>
                                            <Select 
                                                onValueChange={(val) => setEditData({ ...editData, max_delivery_time_hours: Number(val) })}
                                                defaultValue={String(area.max_delivery_time_hours)}
                                            >
                                                <SelectTrigger className="h-9 border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="2">2 Hours</SelectItem>
                                                    <SelectItem value="4">4 Hours</SelectItem>
                                                    <SelectItem value="12">12 Hours</SelectItem>
                                                    <SelectItem value="24">24 Hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="font-bold tabular-nums">₵{Number(area.delivery_fee).toFixed(2)}</span>
                                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                                            <Icon name="schedule" opticalSize={13} />
                                            {area.max_delivery_time_hours}h max
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button size="sm" onClick={() => handleSave(area.id)} disabled={isPending} className="h-8 flex-1 bg-brand-teal hover:bg-brand-teal-dark text-white">
                                                {isPending ? <Icon name="progress_activity" className="animate-spin" opticalSize={14} /> : "Save"}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(area)} className="h-8 flex-1 gap-1.5">
                                                <Icon name="edit" opticalSize={14} /> Edit
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(area.id)} className="h-8 text-rose-500 hover:bg-rose-50">
                                                <Icon name="delete" opticalSize={14} />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Desktop table (hidden on mobile) */}
            {areas.length > 0 && (
                <div className="hidden md:block overflow-x-auto">
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
                            {areas.map((area) => {
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
                                                    <Icon name="location_on" className={cn("text-sm", area.is_active ? "text-slate-600" : "text-slate-400")} opticalSize={18} />
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
                                                    <Icon name="schedule" className="text-slate-400" opticalSize={14} />
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
                                                            {isPending ? <Icon name="progress_activity" className="animate-spin" opticalSize={16} /> : <Icon name="check" opticalSize={16} />}
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-slate-400 hover:bg-slate-50"
                                                            onClick={() => setEditingId(null)}
                                                            disabled={isPending}
                                                        >
                                                            <Icon name="close" opticalSize={16} />
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
                                                            <Icon name="edit" opticalSize={16} />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-rose-400 hover:bg-rose-50"
                                                            onClick={() => handleDelete(area.id)}
                                                        >
                                                            <Icon name="delete" opticalSize={16} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
