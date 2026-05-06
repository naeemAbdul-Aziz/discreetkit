"use client"

import { useState, useEffect, useMemo, useId, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
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

export function ProductTable({ initialProducts, categories = [] }: { initialProducts: Product[], categories?: any[] }) {
  const dropdownMenuId = useId();
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [saving, setSaving] = useState<Record<number, Record<string, boolean>>>({})
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      // Reset to first page when the debounced search value updates
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = filteredProducts.slice((page-1)*pageSize, page*pageSize)

  // Use passed categories or fallback to unique existing ones if empty (though we should always have passed ones now)
  const categoryOptions = categories.length > 0 
    ? categories.map(c => c.name) 
    : Array.from(new Set(products.map(p => p.category).filter(Boolean)))

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
      startTransition(() => {
        router.refresh()
      })
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
      toast({ title: "Saved", description: `${field} updated` })
      startTransition(() => {
        router.refresh()
      })
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
      startTransition(() => {
        router.refresh()
      })
    }
  }

  const getStockInfo = (stock: number) => {
    if (stock <= 5) return { 
      label: "LOW STOCK", 
      variant: "destructive" as const, 
      color: "bg-rose-100/50 text-rose-700 border-rose-200/50 shadow-none", 
      icon: "⚠️" 
    };
    if (stock <= 20) return { 
      label: "LIMITED", 
      variant: "warning" as const, 
      color: "bg-amber-100/50 text-amber-700 border-amber-200/50 shadow-none", 
      icon: "⏳" 
    };
    if (stock >= 50) return { 
      label: "IN STOCK", 
      variant: "success" as const, 
      color: "bg-emerald-100/50 text-emerald-700 border-emerald-200/50 shadow-none", 
      icon: "✨" 
    };
    return { 
      label: "IN STOCK", 
      variant: "success" as const, 
      color: "bg-sky-100/50 text-sky-700 border-sky-200/50 shadow-none", 
      icon: "✅" 
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table className="min-w-[600px]">
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
              const stockInfo = getStockInfo(product.stock_level)
              // Generate stable IDs for each dropdown
              const categoryMenuId = `${dropdownMenuId}-cat-${product.id}`;
              const statusMenuId = `${dropdownMenuId}-status-${product.id}`;
              const actionsMenuId = `${dropdownMenuId}-actions-${product.id}`;
              return (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
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
                        {categoryOptions.map(cat => (
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
                        <Badge 
                          variant={stockInfo.variant} 
                          className={cn("cursor-pointer font-bold tracking-widest text-[9px] px-2 py-0.5 transition-all duration-200 hover:bg-white hover:shadow-sm border uppercase", stockInfo.color)}
                        >
                          {product.status ? product.status.toUpperCase() : stockInfo.label}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" aria-labelledby={statusMenuId}>
                        {statusOptions.map(s => (
                          <DropdownMenuItem key={s} onClick={() => handleInlineUpdate(product.id,'status',s)}>
                            {(s || '').toUpperCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-slate-700">
                    <InlineNumber
                      value={product.price_ghs}
                      prefix="GHS"
                      saving={!!saving[product.id]?.price_ghs}
                      onCommit={(val) => handleInlineUpdate(product.id,'price_ghs',val)}
                    />
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell tabular-nums font-medium">
                    <div className="flex items-center justify-end gap-3">
                        <span className="text-[10px] opacity-40">{stockInfo.icon}</span>
                        <InlineNumber
                          value={product.stock_level}
                          saving={!!saving[product.id]?.stock_level}
                          onCommit={(val) => handleInlineUpdate(product.id,'stock_level',val)}
                          warning={product.stock_level < 10}
                        />
                    </div>
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
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                    <div className="bg-slate-50 p-6 rounded-full border-2 border-dashed border-slate-200">
                      <Search className="h-10 w-10 opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">No Products Found</h3>
                      <p className="text-xs font-medium italic">Try a different search or add a new product to the list.</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 font-bold text-[10px] uppercase tracking-widest" onClick={() => setSearchTerm("")}>Clear Search</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
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
        categories={categories}
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
    <div className={cn(
      "inline-flex items-center justify-end gap-1 px-2 py-1 rounded-md transition-all duration-300",
      warning ? "bg-rose-50 text-rose-700" : "hover:bg-slate-100"
    )}>  
      {prefix && <span className="text-[10px] font-bold text-slate-400 mr-1">{prefix}</span>}
      <input
        className={cn(
          "w-20 bg-transparent text-right tabular-nums border-none focus:ring-0 rounded p-0 text-sm outline-none transition",
          warning && "font-bold"
        )}
        value={draft}
        onChange={e=> setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e=> { if(e.key==='Enter'){ (e.target as HTMLInputElement).blur(); } }}
        type="number"
        aria-label={prefix ? `${prefix} value` : 'number value'}
      />
      {saving && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
    </div>
  )
}

function InlineImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false)
  return (
    <div className="relative group/img h-12 w-12 rounded-[4px] overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      {src && !errored ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover transition-transform duration-500 group-hover/img:scale-110" 
          onError={()=> setErrored(true)} 
        />
      ) : (
        <span className="text-[10px] font-bold opacity-30">IMG</span>
      )}
    </div>
  )
}
