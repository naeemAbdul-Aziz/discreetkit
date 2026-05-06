"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  PackagePlus,
  AlertTriangle,
  FileText,
  CreditCard,
  History,
  Activity,
  ShieldCheck,
  Network,
  Zap,
  ArrowRight,
  Filter,
  XCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PharmacyProduct {
  id: number
  pharmacy_id: number
  product_id: number
  stock_level: number
  reorder_level: number
  pharmacy_price_ghs?: number
  is_available: boolean
  last_updated: string
  products: {
    id: number
    name: string
    category: string
    price_ghs: number
    image_url?: string
    requires_prescription: boolean
  }
}

interface Product {
  id: number
  name: string
  category: string
  price_ghs: number
  image_url?: string
}

export function PharmacyInventoryManager({ 
  pharmacyId, 
  initialProducts 
}: { 
  pharmacyId: number
  initialProducts: PharmacyProduct[] 
}) {
  const [products, setProducts] = useState<PharmacyProduct[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const filteredProducts = products.filter(p => 
    p.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.products?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const allProducts = await response.json()
      
      const assignedProductIds = products.map(p => p.product_id)
      const available = allProducts.filter((p: Product) => 
        !assignedProductIds.includes(p.id)
      )
      
      setAvailableProducts(available)
    } catch (error) {
      console.error('Error fetching available products:', error)
      toast({
        variant: "destructive",
        title: "Catalog Sync Error",
        description: "Failed to retrieve global product registry."
      })
    }
  }

  const updateStock = async (productId: number, newStock: number) => {
    try {
      const response = await fetch(
        `/api/admin/pharmacies/${pharmacyId}/products/${productId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_level: newStock })
        }
      )

      if (!response.ok) throw new Error('Failed to update stock')

      setProducts(products.map(p => 
        p.product_id === productId 
          ? { ...p, stock_level: newStock }
          : p
      ))

      toast({
        title: "Telemetry Synchronized",
        description: "Node unit count updated in registry."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failure",
        description: "Failed to synchronize stock level with master terminal."
      })
    }
  }

  const toggleAvailability = async (productId: number, isAvailable: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/pharmacies/${pharmacyId}/products/${productId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_available: isAvailable })
        }
      )

      if (!response.ok) throw new Error('Failed to update availability')

      setProducts(products.map(p => 
        p.product_id === productId 
          ? { ...p, is_available: isAvailable }
          : p
      ))

      toast({
        title: "Protocol Updated",
        description: `SKU operations ${isAvailable ? 'synchronized' : 'suspended'}.`
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Protocol Error",
        description: "Failed to toggle operational status."
      })
    }
  }

  const removeProduct = async (productId: number) => {
    if (!confirm("Confirm decommissioning of this SKU from the operational node?")) return

    try {
      const response = await fetch(
        `/api/admin/pharmacies/${pharmacyId}/products/${productId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to remove product')

      setProducts(products.filter(p => p.product_id !== productId))

      toast({
        title: "Node Decommissioned",
        description: "SKU permanently removed from terminal registry."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registry Error",
        description: "Failed to decommissioning node unit."
      })
    }
  }

  const bulkAssignProducts = async () => {
    if (selectedProducts.length === 0) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/pharmacies/${pharmacyId}/products/bulk-assign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_ids: selectedProducts,
            default_stock_level: 0
          })
        }
      )

      if (!response.ok) throw new Error('Failed to assign products')

      toast({
        title: "Batch Provisioning Complete",
        description: "Selected SKUs integrated into node terminal."
      })

      router.refresh()
      setIsBulkDialogOpen(false)
      setSelectedProducts([])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Provisioning Error",
        description: "Batch mapping protocol failed."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input
            type="search"
            placeholder="Filter Node Registry..."
            className="pl-12 h-12 rounded-full font-black text-xs uppercase tracking-widest border-slate-100 bg-white transition-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-10 rounded-full h-12 shadow-lg shadow-slate-900/10 transition-none" onClick={fetchAvailableProducts}>
              <PackagePlus className="h-4 w-4 mr-3" />
              Provision Master Catalog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[560px] rounded-xl border-none shadow-2xl p-8">
            <DialogHeader className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-brand-teal/5 flex items-center justify-center">
                  <Package className="h-6 w-6 text-brand-teal" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight uppercase">Batch Provisioning</DialogTitle>
                <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Map global master catalog units to this terminal node.</DialogDescription>
              </div>
            </DialogHeader>
            <div className="py-8 space-y-6">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input
                  type="search"
                  placeholder="Synchronize Global SKUs..."
                  className="pl-12 h-12 rounded-full font-black text-xs uppercase tracking-widest border-slate-100 bg-slate-50/50"
                />
              </div>
              <div className="max-h-[340px] overflow-y-auto border border-slate-100 rounded-xl bg-white scrollbar-hide">
                {availableProducts.length === 0 ? (
                    <div className="py-20 text-center">
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-slate-100" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Master Catalog Synchronized</p>
                    </div>
                ) : (
                    availableProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className={cn(
                          "flex items-center p-6 border-b border-slate-50 last:border-b-0 cursor-pointer transition-none group",
                          selectedProducts.includes(product.id) ? "bg-brand-teal/5" : "hover:bg-slate-50/50"
                        )} 
                        onClick={() => {
                          if (selectedProducts.includes(product.id)) {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          } else {
                            setSelectedProducts([...selectedProducts, product.id])
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          className="rounded-sm data-[state=checked]:bg-brand-teal"
                        />
                        <div className="ml-5 flex-1 gap-1 flex flex-col">
                          <p className="font-black text-slate-900 uppercase tracking-widest text-[11px]">{product.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{product.category}</span>
                            <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest">₵{product.price_ghs.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {selectedProducts.length} Streams Selected
                  </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="ghost" onClick={() => setIsBulkDialogOpen(false)} className="rounded-full h-12 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-none flex-1 sm:flex-none">Cancel</Button>
                <Button 
                    onClick={bulkAssignProducts} 
                    disabled={loading || selectedProducts.length === 0} 
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-12 px-10 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-teal/20 transition-none flex-1 sm:flex-none"
                >
                  {loading ? 'Mapping Registry...' : 'Confirm Provisioning'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-[320px] text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 pl-8">SKU Identity</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Class</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Master Price</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Operational Stock</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black text-slate-400 py-6 text-center">Operational Status</TableHead>
              <TableHead className="text-right pr-8 py-6 text-[9px] uppercase tracking-widest font-black text-slate-400">Registry Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="border-slate-50 group hover:bg-slate-50/30 transition-none">
                <TableCell className="pl-8 py-7">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-slate-900 uppercase tracking-widest text-[11px] truncate max-w-[220px]">{product.products?.name || 'Unknown Protocol'}</span>
                            {product.products?.requires_prescription && (
                                <Badge variant="neutral" className="gap-1.5 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border-none bg-slate-900 text-white">
                                    <ShieldCheck className="h-2.5 w-2.5" />
                                    Rx Required
                                </Badge>
                            )}
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {product.product_id}</span>
                    </div>
                </TableCell>
                <TableCell className="py-7 text-center">
                    <div className="flex justify-center">
                        <Badge variant="neutral" className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border-none">
                            {product.products?.category || 'Unclassified'}
                        </Badge>
                    </div>
                </TableCell>
                <TableCell className="py-7 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest tabular-nums">₵{product.products?.price_ghs?.toFixed(2) || '0.00'}</span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">GHS Terminal</span>
                    </div>
                </TableCell>
                <TableCell className="py-7">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center bg-white rounded-full border border-slate-100 p-1 shadow-sm">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-slate-300 hover:text-brand-teal hover:bg-brand-teal/5 transition-none"
                                onClick={() => updateStock(product.product_id, Math.max(0, product.stock_level - 1))}
                            >
                                -
                            </Button>
                            <span className="w-12 text-center font-black text-xs text-slate-900 tabular-nums">
                                {product.stock_level}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-slate-300 hover:text-brand-teal hover:bg-brand-teal/5 transition-none"
                                onClick={() => updateStock(product.product_id, product.stock_level + 1)}
                            >
                                +
                            </Button>
                        </div>
                        {product.stock_level === 0 ? (
                            <Badge variant="neutral" className="gap-1.5 text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border-none bg-rose-50 text-rose-500">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Protocol Depleted
                            </Badge>
                        ) : product.stock_level <= product.reorder_level ? (
                            <Badge variant="neutral" className="gap-1.5 text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border-none bg-amber-50 text-amber-600">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Reorder Threshold
                            </Badge>
                        ) : null}
                    </div>
                </TableCell>
                <TableCell className="py-7">
                    <div className="flex items-center justify-center gap-4">
                        <Switch 
                            id={`available-${product.id}`}
                            checked={product.is_available}
                            onCheckedChange={(checked) => toggleAvailability(product.product_id, checked as boolean)}
                            className="data-[state=checked]:bg-emerald-500 h-5 w-10 transition-none"
                        />
                        <Label htmlFor={`available-${product.id}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer w-20">
                            {product.is_available ? (
                                <span className="text-emerald-600">Operational</span>
                            ) : (
                                <span className="text-slate-200">Suspended</span>
                            )}
                        </Label>
                    </div>
                </TableCell>
                <TableCell className="text-right pr-8 py-7">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-none"
                    onClick={() => removeProduct(product.product_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
          <div className="h-20 w-20 rounded-full bg-white border border-slate-100 flex items-center justify-center">
              <Zap className="h-10 w-10 text-slate-100" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Node Registry Depleted</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest max-w-xs mx-auto">
                No SKUs are currently mapped to this operational node terminal. Provision units from the master catalog.
            </p>
          </div>
          <Button onClick={() => setIsBulkDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-12 px-10 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-none">
            Provision Terminal Node
          </Button>
        </div>
      )}
    </div>
  )
}

export default PharmacyInventoryManager