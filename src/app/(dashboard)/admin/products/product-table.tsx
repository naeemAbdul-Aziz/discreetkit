"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Search, Trash2, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { ProductSheet } from "./product-sheet"
import { deleteProduct } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  category: string
  price_ghs: number
  stock_level: number
  image_url: string | null
  description: string | null
  // Add other fields as needed
}

export function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsSheetOpen(true)
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setIsSheetOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    const res = await deleteProduct(id)
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Deleted", description: "Product removed." })
    }
  }

  const getStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (stock < 10) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "Active", variant: "default" as const }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] hidden md:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right hidden md:table-cell">Stock</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStatus(product.stock_level)
              return (
                <TableRow key={product.id}>
                  <TableCell className="hidden md:table-cell">
                    <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                      {product.image_url && (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      Stock: {product.stock_level}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">GHS {product.price_ghs.toFixed(2)}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{product.stock_level}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        product={selectedProduct} 
      />
    </div>
  )
}
