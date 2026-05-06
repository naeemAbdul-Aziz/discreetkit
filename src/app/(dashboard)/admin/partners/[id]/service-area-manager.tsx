"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, MapPin, Clock, CreditCard, Activity, Network, ShieldCheck, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addServiceArea, deleteServiceArea, toggleServiceAreaStatus } from "@/lib/admin-actions"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface ServiceArea {
    id: number
    area_name: string
    delivery_fee: number
    max_delivery_time_hours: number
    is_active: boolean
}

interface ServiceAreaManagerProps {
    pharmacyId: number
    initialAreas: ServiceArea[]
}

export function ServiceAreaManager({ pharmacyId, initialAreas }: ServiceAreaManagerProps) {
    const [areas, setAreas] = useState<ServiceArea[]>(initialAreas)
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        area_name: "",
        delivery_fee: "15",
        max_delivery_time_hours: "24",
        is_active: true
    })

    const handleAddArea = async () => {
        if (!formData.area_name) {
            toast({
                title: "Validation Error",
                description: "Operational zone identity required.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const result = await addServiceArea({
                pharmacy_id: pharmacyId,
                area_name: formData.area_name,
                delivery_fee: parseFloat(formData.delivery_fee),
                max_delivery_time_hours: parseInt(formData.max_delivery_time_hours),
                is_active: formData.is_active,
            })

            if (result.error) throw new Error(result.error)
            if (result.data) {
                setAreas([...areas, result.data])
                setFormData({ area_name: "", delivery_fee: "15", max_delivery_time_hours: "24", is_active: true })
                setIsDialogOpen(false)
                toast({
                    title: "Node Provisioned",
                    description: "Operational zone successfully integrated into registry.",
                })
            }
        } catch (error: any) {
            toast({
                title: "Provisioning Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteArea = async (id: number) => {
        if (!confirm("Confirm decommissioning of this operational logistics zone?")) return

        try {
            const result = await deleteServiceArea(id)
            if (result.error) throw new Error(result.error)
            
            setAreas(areas.filter(a => a.id !== id))
            toast({
                title: "Zone Decommissioned",
                description: "Node removed from operational grid.",
            })
        } catch (error: any) {
            toast({
                title: "Terminal Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const result = await toggleServiceAreaStatus(id, !currentStatus)
            if (result.error) throw new Error(result.error)
            
            setAreas(areas.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a))
            toast({
                title: "Protocol Updated",
                description: `Zone operations ${!currentStatus ? 'synchronized' : 'deactivated'}.`,
            })
        } catch (error: any) {
             toast({
                title: "Sync Failed",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Network className="h-5 w-5 text-slate-200" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Logistics Nodes</h2>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active operational zones for this terminal</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-full h-11 shadow-lg shadow-slate-900/10 transition-none">
                            <Plus className="h-4 w-4 mr-2.5" />
                            Provision Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[440px] rounded-xl border-none shadow-2xl p-8">
                        <DialogHeader className="space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-brand-teal/5 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-brand-teal" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight uppercase">Provision Node</DialogTitle>
                                <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Integrate a new logistics zone into the operational grid.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="py-8 space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Identity</Label>
                                <Input
                                    id="name"
                                    placeholder="Operational Label (e.g. Accra Central)"
                                    value={formData.area_name}
                                    onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                                    className="h-12 rounded-xl font-black text-xs uppercase tracking-widest border-slate-100 bg-slate-50/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fee" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yield Fee (GHS)</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200" />
                                        <Input
                                            id="fee"
                                            type="number"
                                            className="pl-11 h-12 rounded-xl font-black text-xs uppercase tracking-widest border-slate-100 bg-slate-50/50"
                                            value={formData.delivery_fee}
                                            onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Latency (H)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200" />
                                        <Input
                                            id="time"
                                            type="number"
                                            className="pl-11 h-12 rounded-xl font-black text-xs uppercase tracking-widest border-slate-100 bg-slate-50/50"
                                            value={formData.max_delivery_time_hours}
                                            onChange={(e) => setFormData({ ...formData, max_delivery_time_hours: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                                <Label htmlFor="active" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">Protocol: Operations Ready</Label>
                                <Switch
                                    id="active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    className="data-[state=checked]:bg-brand-teal transition-none"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-3 border-t border-slate-50 pt-6">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full h-12 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-none">Cancel</Button>
                            <Button onClick={handleAddArea} disabled={isLoading} className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-12 px-10 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-teal/20 transition-none">
                                {isLoading ? "Synchronizing..." : "Confirm Provisioning"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 pl-8">Zone Registry</TableHead>
                            <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Status</TableHead>
                            <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Fulfillment Yield</TableHead>
                            <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Latency Cap</TableHead>
                            <TableHead className="w-[80px] text-right pr-8 py-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {areas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 bg-slate-50/20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                                            <ShieldCheck className="h-6 w-6 text-slate-100" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Registry Search Nominal: No Nodes Provisioned</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            areas.map((area) => (
                                <TableRow key={area.id} className="border-slate-50 transition-none group hover:bg-slate-50/30">
                                    <TableCell className="font-black text-slate-900 uppercase tracking-widest text-[11px] py-6 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-brand-teal transition-none" />
                                            {area.area_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex justify-center">
                                            <Badge 
                                                variant="neutral" 
                                                className={cn(
                                                    "cursor-pointer px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border-none transition-none",
                                                    area.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                )}
                                                onClick={() => handleToggleStatus(area.id, area.is_active)}
                                            >
                                                {area.is_active ? "Live" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex justify-center">
                                            <Badge variant="neutral" className="px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full bg-slate-50 text-slate-500 border-none tabular-nums">₵{area.delivery_fee.toFixed(2)}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex justify-center">
                                            <Badge variant="neutral" className="px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full bg-slate-50 text-slate-300 border-none gap-2">
                                                <Clock className="h-2.5 w-2.5" />
                                                {area.max_delivery_time_hours}H Max
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8 py-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-none"
                                            onClick={() => handleDeleteArea(area.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
