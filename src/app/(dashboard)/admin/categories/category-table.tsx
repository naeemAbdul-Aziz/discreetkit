"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Trash2, Tag, ShoppingCart, MoreVertical, Search, Terminal, History, Activity, ShieldCheck, ArrowRight, Filter, AlertTriangle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ActionBar } from "@/components/dashboard/action-bar"
import { BulkActionsBar } from "@/components/dashboard/bulk-actions-bar"
import { CategoryDialog } from "./category-dialog"
import { deleteCategory, updateCategoryName } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface CategoryTableProps {
  initialCategories: any[]
}

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const { toast } = useToast()

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCategories.map(c => c.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleInlineEdit = async (id: number) => {
    if (!editValue || editValue === categories.find(c => c.id === id)?.name) {
      setEditingId(null)
      return
    }
    
    try {
      const res = await updateCategoryName(id, editValue)
      if (res.error) {
        toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error })
      } else {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editValue } : c))
        toast({ title: "REGISTRY_SYNCHRONIZED", description: "Category identity updated in master matrix." })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "TERMINAL_CRITICAL", description: "Failed to finalize metadata sync." })
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async () => {
    const id = deleteId
    if (!id) return
    try {
      const res = await deleteCategory(id)
      if (res.error) {
        toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: res.error })
      } else {
        setCategories(prev => prev.filter(c => c.id !== id))
        toast({ title: "SKU_CLASSIFICATION_DECOMMISSIONED", description: "Category removed from global catalog registry." })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "TERMINAL_CRITICAL", description: "Failed to decommissioning node." })
    } finally {
      setDeleteId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) return
    
    let successCount = 0
    for (const id of selectedIds) {
      const res = await deleteCategory(id)
      if (!res.error) successCount++
    }
    
    if (successCount > 0) {
      setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)))
      toast({ title: "BULK_DECOMMISSION_SIGNAL", description: `Successfully decommissioned ${successCount} classification nodes.` })
      setSelectedIds([])
    }
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 px-2">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-brand-teal transition-none" />
          <Input
            type="search"
            placeholder="FILTER_METADATA_REGISTRY: SEARCH_CLASSIFICATION_NODE..."
            className="pl-20 h-20 rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] border-none bg-slate-50/50 shadow-sm focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none placeholder:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-8">
          <Button 
            onClick={() => { setSelectedCategory(null); setIsDialogOpen(true) }}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-20 px-16 font-black text-sm uppercase tracking-[0.3em] gap-8 shadow-2xl shadow-slate-900/40 transition-none border-none group"
          >
            <Plus className="h-6 w-6 text-brand-teal group-hover:rotate-90 transition-transform duration-300" />
            PROVISION_NEW_CLASSIFICATION
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[120px] pl-16 py-10">
                <Checkbox 
                  checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="rounded-lg h-9 w-9 border-slate-200 bg-white data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none shadow-sm"
                />
              </TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">CLASSIFICATION_IDENTITY_LABEL</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">OPERATIONAL_DESCRIPTION</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 text-center">INVENTORY_DENSITY_SYNC</TableHead>
              <TableHead className="text-right pr-16 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">CONTROL_STATION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow 
                key={category.id} 
                className={cn(
                  "group transition-none border-slate-50 hover:bg-slate-50/30",
                  selectedIds.includes(category.id) && "bg-slate-50/50"
                )}
              >
                <TableCell className="pl-16 py-12">
                  <Checkbox 
                    checked={selectedIds.includes(category.id)}
                    onCheckedChange={() => toggleSelect(category.id)}
                    className="rounded-lg h-9 w-9 border-slate-200 bg-white data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none shadow-sm"
                  />
                </TableCell>
                <TableCell className="py-12">
                  {editingId === category.id ? (
                    <div className="relative group/edit">
                        <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-teal" />
                        <Input 
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleInlineEdit(category.id)}
                            onKeyDown={(e) => e.key === "Enter" && handleInlineEdit(category.id)}
                            className="h-16 pl-16 pr-8 w-[320px] rounded-2xl border-none bg-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 focus-visible:ring-0 transition-none"
                        />
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-6 cursor-text group/item w-fit"
                      onClick={() => { setEditingId(category.id); setEditValue(category.name) }}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10 group-hover/item:scale-105 transition-transform duration-300">
                        <Tag className="h-7 w-7 text-brand-teal" />
                      </div>
                      <div className="space-y-2">
                        <span className="font-black text-slate-900 uppercase tracking-tight text-base leading-none block group-hover/item:text-brand-teal transition-none">{category.name}</span>
                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none block">NODE_ID_#{category.id.toString().padStart(4, '0')}</span>
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-12">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-tight line-clamp-1 max-w-[480px] leading-relaxed" title={category.description}>
                    {category.description?.toUpperCase() || "NO_DESCRIPTION_MAPPED_TO_NODE"}
                  </p>
                </TableCell>
                <TableCell className="py-12 text-center">
                    <div className="flex justify-center">
                        <Link href={`/admin/products?category=${encodeURIComponent(category.name)}`}>
                            <Badge variant="outline" className="rounded-full bg-slate-50 text-slate-600 border-none hover:bg-slate-900 hover:text-white transition-none font-black text-[10px] uppercase tracking-widest px-8 py-3.5 gap-4 shadow-sm group/badge">
                                <ShoppingCart className="h-4 w-4 text-slate-300 group-hover/badge:text-brand-teal transition-none" />
                                {category.productCount || 0} UNITS_MAPPED
                            </Badge>
                        </Link>
                    </div>
                </TableCell>
                <TableCell className="text-right pr-16 py-12">
                  <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-none">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-14 w-14 text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-none border-none shadow-sm"
                      onClick={() => { setSelectedCategory(category); setIsDialogOpen(true) }}
                    >
                      <Edit className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-14 w-14 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-none border-none shadow-sm"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-80 text-center bg-transparent border-none">
                  <div className="flex flex-col items-center justify-center gap-12">
                    <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Search className="h-20 w-20 text-slate-100" />
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">REGISTRY_SCAN_NOMINAL</h3>
                      <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
                          No classification records match the current filter parameters. Synchronize metadata telemetry to refresh terminal nodes.
                      </p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="h-16 px-16 rounded-full font-black text-[12px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-2xl shadow-slate-900/5 gap-6" 
                        onClick={() => setSearchTerm("")}
                    >
                        <History className="h-5 w-5" />
                        RESET_METADATA_FILTERS
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: "BULK_DECOMMISSION_SIGNAL", onClick: handleBulkDelete, icon: <Trash2 className="h-6 w-6" />, variant: "destructive" }
        ]}
      />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[48px] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-[640px] transition-none">
          <div className="p-16 border-b border-slate-50 flex items-center gap-10 bg-slate-50/30 backdrop-blur-3xl">
              <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/40">
                  <AlertTriangle className="h-10 w-10 text-rose-500" />
              </div>
              <div className="space-y-4">
                  <AlertDialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Confirm_Decommission</AlertDialogTitle>
                  <div className="flex items-center gap-6">
                      <div className="h-2 w-12 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
                      <AlertDialogDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">High-stakes operational sequence initiated.</AlertDialogDescription>
                  </div>
              </div>
          </div>
          <div className="p-16 bg-white">
              <p className="text-[13px] font-black text-slate-600 uppercase tracking-[0.3em] leading-relaxed">
                  Are you sure you want to decommission this classification node? SKUs linked to this registry will remain active but may become unmapped in the global matrix. This action is irreversible.
              </p>
          </div>
          <AlertDialogFooter className="p-16 pt-0 flex flex-col md:flex-row gap-8">
            <AlertDialogCancel className="h-20 flex-1 rounded-full font-black text-[12px] uppercase tracking-[0.3em] bg-slate-50 border-none hover:bg-slate-100 transition-none text-slate-400">ABORT_SEQUENCE</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="h-20 flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-rose-600/40 transition-none border-none gap-6">
              CONFIRM_DECOMMISSION_EXECUTE
              <ArrowRight className="h-6 w-6" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
