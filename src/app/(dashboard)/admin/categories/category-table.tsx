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
import { Edit, Plus, Trash2, Tag, ShoppingCart, MoreVertical, Search } from "lucide-react"
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
        toast({ variant: "destructive", title: "Error", description: res.error })
      } else {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editValue } : c))
        toast({ title: "Success", description: "Category updated." })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update." })
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
        toast({ variant: "destructive", title: "Error", description: res.error })
      } else {
        setCategories(prev => prev.filter(c => c.id !== id))
        toast({ title: "Success", description: "Category deleted." })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete." })
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
      toast({ title: "Bulk Action", description: `Deleted ${successCount} categories.` })
      setSelectedIds([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and organize your product catalog.</p>
        </div>
        <Button 
          onClick={() => { setSelectedCategory(null); setIsDialogOpen(true) }}
          className="bg-brand-indigo hover:bg-brand-indigo/90 shadow-lg shadow-brand-indigo/20 rounded-xl px-6 h-11"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <ActionBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by name..."
      />

      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox 
                    checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Description</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Inventory</TableHead>
                <TableHead className="text-right pr-6 text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow 
                  key={category.id} 
                  className={cn(
                    "group transition-colors border-slate-100",
                    selectedIds.includes(category.id) ? "bg-brand-indigo/[0.02]" : "hover:bg-slate-50/50"
                  )}
                >
                  <TableCell className="pl-6">
                    <Checkbox 
                      checked={selectedIds.includes(category.id)}
                      onCheckedChange={() => toggleSelect(category.id)}
                      aria-label={`Select ${category.name}`}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    {editingId === category.id ? (
                      <Input 
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleInlineEdit(category.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleInlineEdit(category.id)}
                        className="h-8 max-w-[200px] text-sm font-semibold"
                      />
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-text group/item"
                        onClick={() => { setEditingId(category.id); setEditValue(category.name) }}
                      >
                        <Tag className="h-3.5 w-3.5 text-slate-300 group-hover/item:text-brand-indigo transition-colors" />
                        <span className="font-bold text-slate-900 group-hover/item:text-brand-indigo transition-colors">{category.name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="text-sm text-slate-500 line-clamp-1 max-w-md" title={category.description}>
                      {category.description || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <Link href={`/admin/products?category=${encodeURIComponent(category.name)}`}>
                      <Badge variant="outline" className="rounded-lg bg-slate-50 text-slate-600 border-slate-200 hover:bg-brand-indigo/5 hover:text-brand-indigo hover:border-brand-indigo/20 transition-all font-semibold px-2 py-0.5 gap-1.5 cursor-pointer">
                        <ShoppingCart className="h-3 w-3" />
                        {category.productCount || 0} Products
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-lg"
                        onClick={() => { setSelectedCategory(category); setIsDialogOpen(true) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">No categories found</p>
                        <p className="text-xs text-slate-500">Try adjusting your search or add a new category.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="mt-2 rounded-lg">
                        Clear Search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: "Delete Selected", onClick: handleBulkDelete, icon: <Trash2 className="h-4 w-4" />, variant: "destructive" }
        ]}
      />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Are you sure you want to delete this category? Products linked to it will not be deleted but may become unorganized. This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold bg-slate-100 border-none hover:bg-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 px-6">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

