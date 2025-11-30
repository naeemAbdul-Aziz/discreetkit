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
import { Plus, Trash2, MapPin, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addServiceArea, deleteServiceArea } from "@/lib/admin-actions"

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
    })

    const handleAddArea = async () => {
        if (!formData.area_name) {
            toast({
                title: "Error",
                description: "Area name is required",
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
            })

            if (result.error) throw new Error(result.error)
            if (result.data) {
                setAreas([...areas, result.data])
                setFormData({ area_name: "", delivery_fee: "15", max_delivery_time_hours: "24" })
                setIsDialogOpen(false)
                toast({
                    title: "Success",
                    description: "Service area added successfully",
                })
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteArea = async (id: number) => {
        if (!confirm("Are you sure you want to delete this service area?")) return

        try {
            const result = await deleteServiceArea(id)
            if (result.error) throw new Error(result.error)
            
            setAreas(areas.filter(a => a.id !== id))
            toast({
                title: "Success",
                description: "Service area deleted",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Service Areas
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage delivery zones and fees for this pharmacy.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Area
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Service Area</DialogTitle>
                            <DialogDescription>
                                Define a new delivery zone for this pharmacy.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Area Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. East Legon"
                                    value={formData.area_name}
                                    onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fee">Delivery Fee (GHS)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fee"
                                            type="number"
                                            className="pl-8"
                                            value={formData.delivery_fee}
                                            onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Max Time (Hours)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="time"
                                            type="number"
                                            className="pl-8"
                                            value={formData.max_delivery_time_hours}
                                            onChange={(e) => setFormData({ ...formData, max_delivery_time_hours: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddArea} disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Area"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Area Name</TableHead>
                            <TableHead>Delivery Fee</TableHead>
                            <TableHead>Max Time</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {areas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No service areas defined yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            areas.map((area) => (
                                <TableRow key={area.id}>
                                    <TableCell className="font-medium">{area.area_name}</TableCell>
                                    <TableCell>GHS {area.delivery_fee.toFixed(2)}</TableCell>
                                    <TableCell>{area.max_delivery_time_hours} hours</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
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
