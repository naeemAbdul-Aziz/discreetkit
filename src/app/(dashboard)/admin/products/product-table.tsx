"use client"

import { useState, useEffect, useId, useTransition } from "react"
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
import { MoreHorizontal, Plus, Search, Trash2, Edit, Loader2, AlertTriangle, CheckCircle2, Zap, History, Terminal, Network, ShieldCheck, ArrowRight, Activity, Filter, Package } from "lucide-react"
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = filteredProducts.slice((page-1)*pageSize, page*pageSize)

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
      toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error })
      startTransition(() => {
        router.refresh()
      })
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
      toast({ title: "REGISTRY_SYNCHRONIZED", description: `${field.toUpperCase()} updated in global matrix.` })
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
    if (!confirm("Confirm decommissioning of this SKU from the global catalog registry?")) return
    
    const res = await deleteProduct(id)
    if (res.error) {
      toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error })
    } else {
      toast({ title: "SKU_DECOMMISSIONED", description: "Global product removed from active registry." })
      startTransition(() => {
        router.refresh()
      })
    }
  }

  const getStockInfo = (stock: number) => {
    if (stock <= 5) return { label: "CRITICAL_LEVEL", variant: "destructive" as const, color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: <AlertTriangle className="h-4 w-4" /> };
    if (stock <= 20) return { label: "LOW_STOCK_SYNC", variant: "warning" as const, color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <AlertTriangle className="h-4 w-4" /> };
    return { label: "ACTIVE_INVENTORY", variant: "success" as const, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: <CheckCircle2 className="h-4 w-4" /> };
  }

  return (
    <div className="space-y-16">
      {/* Search and Action Interface */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 px-2">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-brand-teal transition-none" />
          <Input
            type="search"
            placeholder="FILTER_CATALOG_REGISTRY: SEARCH_SKU_IDENTITY..."
            className="pl-20 h-20 rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] border-none bg-slate-50/50 shadow-sm focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none placeholder:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-8">
          {isPending && <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />}
          <Button 
            onClick={handleAdd} 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-20 px-16 font-black text-sm uppercase tracking-[0.3em] gap-8 shadow-2xl shadow-slate-900/40 transition-none border-none group"
          >
            <Plus className="h-6 w-6 text-brand-teal group-hover:rotate-90 transition-transform duration-300" />
            PROVISION_NEW_SKU_PROTOCOL
          </Button>
        </div>
      </div>

      {/* Terminal Feed Grid */}
      <div className="overflow-hidden">
        <Table className="min-w-[1400px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[140px] text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 pl-16">IDENTITY_IMG</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">SKU_DESIGNATION_IDENTITY</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">CLASSIFICATION_MATRIX</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">OPERATIONAL_STATUS</TableHead>
              <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">GLOBAL_YIELD_MARKET</TableHead>
              <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">REGISTRY_UNIT_COUNT</TableHead>
              <TableHead className="w-[120px] text-right pr-16 py-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const stockInfo = getStockInfo(product.stock_level)
              const categoryMenuId = `${dropdownMenuId}-cat-${product.id}`;
              const statusMenuId = `${dropdownMenuId}-status-${product.id}`;
              const actionsMenuId = `${dropdownMenuId}-actions-${product.id}`;
              return (
                <TableRow key={product.id} className="group border-slate-50 hover:bg-slate-50/30 transition-none">
                  <TableCell className="pl-16 py-10">
                    <InlineImage src={product.image_url} alt={product.name} />
                  </TableCell>
                  <TableCell className="py-10">
                    <div className="space-y-3">
                        <span className="font-black text-slate-900 uppercase tracking-tight text-base leading-none block">{product.name}</span>
                        <div className="flex items-center gap-4">
                            <div className="h-1.5 w-8 bg-slate-100 rounded-full" />
                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] leading-none tabular-nums">SKU_ID_#{product.id.toString().padStart(6, '0')}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild id={categoryMenuId}>
                        <Button variant="ghost" size="sm" className="h-12 px-8 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-2xl hover:shadow-slate-900/5 transition-none outline-none focus:ring-0">
                          {product.category ? product.category.toUpperCase().replace(/_/g, ' ') : 'UNCLASSIFIED_NODE'}
                          <Filter className="ml-4 h-3.5 w-3.5 opacity-30" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="max-h-[400px] w-64 overflow-y-auto rounded-[32px] border-none shadow-2xl p-4 bg-white transition-none z-[100] scrollbar-hide">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 px-6 py-4">SELECT_CLASSIFICATION_PROTOCOL</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50 mx-2 mb-2" />
                        {categoryOptions.map(cat => (
                          <DropdownMenuItem key={cat} onClick={() => handleInlineUpdate(product.id,'category',cat)} className="text-[11px] font-black uppercase tracking-widest text-slate-500 rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-900 focus:text-white transition-none mb-1 last:mb-0">
                            {cat.toUpperCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="py-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild id={statusMenuId}>
                        <Badge 
                          variant="outline" 
                          className={cn(
                              "cursor-pointer gap-4 rounded-full px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] shadow-sm transition-none border-none outline-none focus:ring-0", 
                              stockInfo.color
                          )}
                        >
                          {stockInfo.icon}
                          {product.status ? product.status.toUpperCase() : stockInfo.label}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="rounded-[32px] border-none shadow-2xl p-4 bg-white w-64 transition-none z-[100]">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 px-6 py-4">OPERATIONAL_REGISTRY_STATUS</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50 mx-2 mb-2" />
                        {statusOptions.map(s => (
                          <DropdownMenuItem key={s} onClick={() => handleInlineUpdate(product.id,'status',s)} className="text-[11px] font-black uppercase tracking-widest text-slate-500 rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-900 focus:text-white transition-none mb-1 last:mb-0">
                            {(s || '').toUpperCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right py-10">
                    <InlineNumber
                      value={product.price_ghs}
                      prefix="₵"
                      saving={!!saving[product.id]?.price_ghs}
                      onCommit={(val) => handleInlineUpdate(product.id,'price_ghs',val)}
                    />
                  </TableCell>
                  <TableCell className="text-right py-10">
                    <InlineNumber
                      value={product.stock_level}
                      saving={!!saving[product.id]?.stock_level}
                      onCommit={(val) => handleInlineUpdate(product.id,'stock_level',val)}
                      warning={product.stock_level < 10}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-16 py-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild id={actionsMenuId}>
                        <Button variant="ghost" className="h-14 w-14 p-0 rounded-full text-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-none border-none shadow-sm">
                          <MoreHorizontal className="h-7 w-7" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[32px] border-none shadow-2xl w-64 p-4 bg-white transition-none z-[100]">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 px-6 py-4">TERMINAL_CONTROL_STATION</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50 mx-2 mb-2" />
                        <DropdownMenuItem onClick={() => handleEdit(product)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 rounded-2xl px-6 py-5 cursor-pointer focus:bg-slate-50 focus:text-slate-900 transition-none gap-6 mb-1">
                          <Edit className="h-5 w-5 text-slate-300" /> EDIT_SKU_PARAMETERS
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-50 mx-2 mb-2" />
                        <DropdownMenuItem className="text-rose-600 text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-5 cursor-pointer focus:bg-rose-50 transition-none gap-6" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-5 w-5 text-rose-400" /> DECOMMISSION_SKU_SIGNAL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-80 text-center bg-transparent border-none">
                  <div className="flex flex-col items-center justify-center gap-12">
                    <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Search className="h-20 w-20 text-slate-100" />
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">REGISTRY_SCAN_NOMINAL</h3>
                      <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
                          No SKU records match the current filter parameters in the global registry matrix. Synchronize search telemetry to refresh terminal.
                      </p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="h-16 px-16 rounded-full font-black text-[12px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-2xl shadow-slate-900/5 gap-6" 
                        onClick={() => setSearchTerm("")}
                    >
                        <History className="h-5 w-5" />
                        RESET_TERMINAL_FILTERS
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Frame Control Matrix */}
      {filteredProducts.length > pageSize && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 px-8 pt-16 border-t border-slate-50">
          <div className="flex items-center gap-8">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">MATRIX_DENSITY_SCALE:</span>
            <div className="bg-slate-50/50 rounded-full px-8 py-3.5 shadow-sm border border-slate-50">
                <select
                className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                >
                {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size} STREAMS / FRAME</option>
                ))}
                </select>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p-1))}
                className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
            >
                PREVIOUS_FRAME
            </Button>
            <div className="h-14 px-8 rounded-[20px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/40">
                <span className="text-[13px] font-black text-brand-teal uppercase tracking-[0.3em] tabular-nums">{page} / {totalPages}</span>
            </div>
            <Button 
                variant="outline" 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
            >
                NEXT_FRAME
            </Button>
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

function InlineNumber({ value, onCommit, prefix, saving, warning }: { value: number; onCommit: (v:number)=>void; prefix?: string; saving?: boolean; warning?: boolean }) {
  const [draft, setDraft] = useState<string>(String(value))
  useEffect(()=>{ setDraft(String(value)) }, [value])
  const commit = () => {
    const num = Number(draft)
    if (!isNaN(num) && num !== value) onCommit(num)
  }
  return (
    <div className={cn(
      "inline-flex items-center justify-end gap-6 px-8 py-5 rounded-[24px] transition-none shadow-sm group/input",
      warning ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5 text-slate-900 border border-transparent hover:border-slate-100"
    )}>  
      {prefix && <span className="text-sm font-black text-slate-300 leading-none group-hover/input:text-brand-teal transition-none">{prefix}</span>}
      <input
        className="w-32 bg-transparent text-right tabular-nums border-none focus:ring-0 p-0 text-2xl font-black uppercase tracking-tighter outline-none leading-none"
        value={draft}
        onChange={e=> setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e=> { if(e.key==='Enter'){ (e.target as HTMLInputElement).blur(); } }}
        type="number"
      />
      {saving ? <Loader2 className="h-5 w-5 animate-spin text-brand-teal" /> : <Zap className="h-5 w-5 text-slate-100 group-hover/input:text-brand-teal transition-none" />}
    </div>
  )
}

function InlineImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false)
  return (
    <div className="relative h-20 w-20 rounded-[32px] overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 shadow-2xl transition-none group-hover:scale-105 duration-500">
      {src && !errored ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover transition-none opacity-80 group-hover:opacity-100 duration-500" 
          onError={()=> setErrored(true)} 
        />
      ) : (
        <Package className="h-10 w-10 text-slate-700" />
      )}
    </div>
  )
}
