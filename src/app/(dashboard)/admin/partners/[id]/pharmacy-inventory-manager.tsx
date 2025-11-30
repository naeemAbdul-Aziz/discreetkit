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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  PackagePlus 
} from "lucide-react"

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const filteredProducts = products.filter(p => 
    p.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.products.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const allProducts = await response.json()
      
      // Filter out products already assigned to this pharmacy
      const assignedProductIds = products.map(p => p.product_id)
      const available = allProducts.filter((p: Product) => 
        !assignedProductIds.includes(p.id)
      )
      
      setAvailableProducts(available)
    } catch (error) {
      console.error('Error fetching available products:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch available products"
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

      // Update local state
      setProducts(products.map(p => 
        p.product_id === productId 
          ? { ...p, stock_level: newStock }
          : p
      ))

      toast({
        title: "Stock Updated",
        description: "Product stock level has been updated"
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock level"
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

      // Update local state
      setProducts(products.map(p => 
        p.product_id === productId 
          ? { ...p, is_available: isAvailable }
          : p
      ))

      toast({
        title: "Availability Updated",
        description: `Product ${isAvailable ? 'enabled' : 'disabled'} for this pharmacy`
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product availability"
      })
    }
  }

  const removeProduct = async (productId: number) => {
    try {
      const response = await fetch(
        `/api/admin/pharmacies/${pharmacyId}/products/${productId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to remove product')

      setProducts(products.filter(p => p.product_id !== productId))

      toast({
        title: "Product Removed",
        description: "Product has been removed from this pharmacy"
      })
    } catch (error) {
      console.error('Error removing product:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove product"
      })
    }
  }

  const bulkAssignProducts = async () => {
    if (selectedProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Products Selected",
        description: "Please select at least one product to assign"
      })
      return
    }

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

      const result = await response.json()
      
      toast({
        title: "Products Assigned",
        description: `${result.assigned} products assigned to pharmacy`
      })

      // Refresh the page to show new products
      router.refresh()
      setIsBulkDialogOpen(false)
      setSelectedProducts([])
    } catch (error) {
      console.error('Error bulk assigning products:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign products"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Product Inventory</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={fetchAvailableProducts}>
                <PackagePlus className="h-4 w-4 mr-2" />
                Bulk Assign Products
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Products to Pharmacy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search available products..."
                    className="pl-8"
                  />
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {availableProducts.map((product) => (
                    <div key={product.id} className="flex items-center p-3 border-b last:border-b-0">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category} • GHS {product.price_ghs}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedProducts.length} product(s) selected
                  </p>
                  <Button onClick={bulkAssignProducts} disabled={loading}>
                    {loading ? 'Assigning...' : 'Assign Selected Products'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Global Price</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
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
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">
            {products.length === 0 
              ? "This pharmacy doesn't have any products assigned yet."
              : "No products match your search criteria."
            }
          </p>
          <Button onClick={() => setIsBulkDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Products
          </Button>
        </div>
      )}
    </div>
  )
}

export default PharmacyInventoryManager