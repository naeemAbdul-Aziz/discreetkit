"use client"

import { useState, useEffect, useMemo, useId } from "react"
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
import { MoreHorizontal, Plus, Search, Trash2, Edit, Loader2 } from "lucide-react"
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
import { deleteProduct, updateProductField } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  category: string
  price_ghs: number
  stock_level: number
  image_url: string | null
  description: string | null
  status?: 'active' | 'draft' | 'archived'
}

export function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const dropdownMenuId = useId();
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [saving, setSaving] = useState<Record<number, Record<string, boolean>>>({})
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Reset to first page on search
  useEffect(() => { setPage(1) }, [debouncedSearch])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = filteredProducts.slice((page-1)*pageSize, page*pageSize)

  // Unique categories for dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  }, [products])

  const statusOptions: Product['status'][] = ['active','draft','archived']

  const markSaving = (id: number, field: string, value: boolean) => {
    setSaving(prev => ({
      ...prev,
      [id]: { ...(prev[id]||{}), [field]: value }
    }))
  }

  const handleInlineUpdate = async (id: number, field: keyof Product, value: any) => {
    markSaving(id, field, true)
    const res = await updateProductField(id, { [field]: value } as any)
    if (res.error) {
      toast({ variant: "destructive", title: "Update failed", description: res.error })
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
      toast({ title: "Saved", description: `${field} updated` })
    }
    markSaving(id, field, false)
  }

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
            {paginatedProducts.map((product, idx) => {
              const status = getStatus(product.stock_level)
              // Generate stable IDs for each dropdown
              const categoryMenuId = `${dropdownMenuId}-cat-${product.id}`;
              const statusMenuId = `${dropdownMenuId}-status-${product.id}`;
              const actionsMenuId = `${dropdownMenuId}-actions-${product.id}`;
              return (
                <TableRow key={product.id}>
                  <TableCell className="hidden md:table-cell">
                    <InlineImage src={product.image_url} alt={product.name} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      Stock: {product.stock_level}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild id={categoryMenuId}>
                        <Button variant="ghost" size="sm" className="px-2">
                          {product.category || '—'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto" aria-labelledby={categoryMenuId}>
                        {categories.map(cat => (
                          <DropdownMenuItem key={cat} onClick={() => handleInlineUpdate(product.id,'category',cat)}>
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild id={statusMenuId}>
                        <Badge variant={status.variant} className="cursor-pointer">
                          {product.status || status.label}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" aria-labelledby={statusMenuId}>
                        {statusOptions.map(s => (
                          <DropdownMenuItem key={s} onClick={() => handleInlineUpdate(product.id,'status',s)}>
                            {(s || '').charAt(0).toUpperCase()+(s || '').slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <InlineNumber
                      value={product.price_ghs}
                      prefix="GHS"
                      saving={!!saving[product.id]?.price_ghs}
                      onCommit={(val) => handleInlineUpdate(product.id,'price_ghs',val)}
                    />
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <InlineNumber
                      value={product.stock_level}
                      saving={!!saving[product.id]?.stock_level}
                      warning={product.stock_level < 20}
                      onCommit={(val) => handleInlineUpdate(product.id,'stock_level',val)}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild id={actionsMenuId}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" aria-labelledby={actionsMenuId}>
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
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-sm">No products found</span>
                    <Button variant="outline" size="sm" onClick={handleAdd}>Add your first product</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > pageSize && (
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              title="Rows per page"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>&lt;</Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>&gt;</Button>
          </div>
        </div>
      )}

      <ProductSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        product={selectedProduct} 
      />
    </div>
  )
}

// Inline number edit component
function InlineNumber({ value, onCommit, prefix, saving, warning }: { value: number; onCommit: (v:number)=>void; prefix?: string; saving?: boolean; warning?: boolean }) {
  const [draft, setDraft] = useState<string>(String(value))
  useEffect(()=>{ setDraft(String(value)) }, [value])
  const commit = () => {
    const num = Number(draft)
    if (!isNaN(num) && num !== value) onCommit(num)
  }
  return (
    <div className={`inline-flex items-center justify-end gap-1 ${warning ? 'text-red-600' : ''}`}>  
      {prefix && <span className="text-xs text-muted-foreground mr-1">{prefix}</span>}
      <input
        className={`w-20 bg-transparent text-right border border-transparent focus:border-primary/50 rounded px-1 py-0.5 text-sm outline-none transition ${warning ? 'font-semibold' : ''}`}
        value={draft}
        onChange={e=> setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e=> { if(e.key==='Enter'){ (e.target as HTMLInputElement).blur(); } }}
        type="number"
        aria-label={prefix ? `${prefix} value` : 'number value'}
      />
      {saving && <Loader2 className="h-3 w-3 animate-spin" />}
      {warning && <span className="text-[10px] uppercase bg-red-100 text-red-700 px-1 rounded">Low</span>}
    </div>
  )
}

function InlineImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false)
  return (
    <div className="relative h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
      {src && !errored ? (
        <Image src={src} alt={alt} fill className="object-cover" onError={()=> setErrored(true)} />
      ) : (
        <span className="text-[10px]">IMG</span>
      )}
    </div>
  )
}
