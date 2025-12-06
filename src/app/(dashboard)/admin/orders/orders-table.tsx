"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { MoreHorizontal, Search, Clock, Package, Truck, CheckCircle, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { assignPharmacy, bulkUpdateOrderStatus, searchPharmacies } from "@/lib/admin-actions"
import { getSupabaseClient } from "@/lib/supabase"

// Helper
const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkSaving, setBulkSaving] = useState(false)
  const [assigningId, setAssigningId] = useState<number | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (o.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, filterStatus])


  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)

  // Realtime Subscription
  useEffect(() => {
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          // Handle UPDATE
          if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new
            setOrders(prev => prev.map(o => {
               if (o.id === updatedOrder.id) {
                   // Create a merged object retaining the existing 'pharmacies' join 
                   // unless we want to re-fetch. For status updates, this is sufficient.
                   return { 
                       ...o, 
                       ...updatedOrder, 
                       // Ensure nested object is preserved if not in payload
                       pharmacies: o.pharmacies 
                   }
               }
               return o
            }))
            toast({
                title: "Order Updated",
                description: `Order ${updatedOrder.code || ''} status changed to ${updatedOrder.status}`,
            })
          } 
          // Handle INSERT (New Order)
          else if (payload.eventType === 'INSERT') {
             // For new orders, we usually need the joined data. 
             // We can either trigger a re-fetch of the page or just add it optimistically.
             // Given the 'pharmacies' join complication, a simple router.refresh() 
             // is the most robust way to get the full data structure, 
             // but user might lose scroll position. 
             // Let's add it to the top locally with null pharmacy if unknown.
             const newOrder = {
                 ...payload.new,
                 pharmacies: null
             }
             setOrders(prev => [newOrder, ...prev])
             toast({
                 title: "New Order Received",
                 description: `Order ${newOrder.code} has been placed.`,
             })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      
      const res = await bulkUpdateOrderStatus([orderId], newStatus)
      if (res.error) {
          toast({ variant: 'destructive', title: 'Update failed', description: res.error })
          // Revert
          router.refresh()
      } else {
          toast({ title: 'Status Updated', description: `Order status changed to ${titleCase(newStatus)}` })
      }
  }

  const handleAssignPharmacy = async (orderId: number, pharmacyId: number, pharmacyName: string) => {
      setAssigningId(orderId)
      try {
          const res = await assignPharmacy(orderId, pharmacyId)
          if (res.success) {
              toast({ title: 'Pharmacy Assigned', description: `Order assigned to ${pharmacyName}` })
              setOrders(prev => prev.map(o => o.id === orderId ? { 
                  ...o, 
                  pharmacy_id: pharmacyId, 
                  pharmacies: { name: pharmacyName },
                  status: o.status === 'pending_payment' ? 'received' : o.status 
              } : o))
          } else {
              toast({ variant: 'destructive', title: 'Assignment Failed', description: res.error })
          }
      } catch (e) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign pharmacy' })
      } finally {
          setAssigningId(null)
      }
  }

  const getStatusBadge = (status: string) => {
    const base = titleCase(status)
    switch (status) {
      case 'completed': 
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {base}
          </Badge>
        )
      case 'processing': 
        return (
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            {base}
          </Badge>
        )
      case 'out_for_delivery': 
        return (
          <Badge variant="warning" className="gap-1">
            <Truck className="h-3 w-3" />
            {base}
          </Badge>
        )
      case 'pending_payment': 
        return (
          <Badge variant="pending" className="gap-1">
            <CreditCard className="h-3 w-3" />
            {base}
          </Badge>
        )
      case 'received': 
        return (
          <Badge variant="info" className="gap-1">
            <Clock className="h-3 w-3" />
            {base}
          </Badge>
        )
      default: 
        return <Badge variant="outline">{base}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded border bg-muted/40">
          <span className="text-sm">{selectedIds.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" disabled={bulkSaving}>Change Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {['pending_payment','received','processing','out_for_delivery','completed'].map(s => (
                <DropdownMenuItem key={s} disabled={bulkSaving} onClick={async()=> {
                  setBulkSaving(true)
                  const res = await bulkUpdateOrderStatus(Array.from(selectedIds), s)
                  if (res.error) {
                    toast({ variant:'destructive', title:'Bulk update failed', description: res.error })
                  } else {
                    toast({ title:'Bulk Updated', description:`Set ${selectedIds.size} orders to ${titleCase(s)}` })
                    setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: s } : o))
                    setSelectedIds(new Set())
                  }
                  setBulkSaving(false)
                }}>
                  {titleCase(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="ghost" onClick={()=> setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          {['all','pending_payment','received','processing','out_for_delivery','completed'].map(s => (
            <Button key={s} variant={filterStatus===s? 'default':'outline'} size="sm" onClick={()=> setFilterStatus(s)}>
              {s==='all' ? 'All' : titleCase(s)}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={filteredOrders.length>0 && filteredOrders.every(o=> selectedIds.has(o.id))}
                  onChange={e=> {
                    if (e.target.checked) {
                      setSelectedIds(new Set(filteredOrders.map(o=> o.id)))
                    } else {
                      setSelectedIds(new Set())
                    }
                  }}
                  className="h-4 w-4 rounded border" />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pharmacy</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id} className={selectedIds.has(order.id) ? 'bg-muted/30' : ''}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Select order ${order.code}`}
                    checked={selectedIds.has(order.id)}
                    onChange={e=> {
                      setSelectedIds(prev => {
                        const next = new Set(prev)
                        if (e.target.checked) next.add(order.id); else next.delete(order.id)
                        return next
                      })
                    }}
                    className="h-4 w-4 rounded border" />
                </TableCell>
                <TableCell className="font-medium">{order.code}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(order.created_at).toISOString().slice(0, 10)}
                </TableCell>
                <TableCell>{order.email || 'Anonymous'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        {getStatusBadge(order.status)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {['pending_payment','received','processing','out_for_delivery','completed'].map(s => (
                        <DropdownMenuItem key={s} onClick={()=> handleStatusChange(order.id, s)}>
                          {titleCase(s)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <PharmacyCombobox
                    initialName={order.pharmacies?.name}
                    value={order.pharmacy_id}
                    onAssign={(pid, pname)=> handleAssignPharmacy(order.id, pid, pname)}
                    loading={assigningId===order.id}
                  />
                </TableCell>
                <TableCell className="text-right">GHS {Number(order.total_price || 0).toFixed(2)}</TableCell>
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
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                            <DropdownMenuRadioItem value="pending_payment">Pending Payment</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="received">Received</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="processing">Processing</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="out_for_delivery">Out for Delivery</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {order.pharmacy_id ? 'Reassign Pharmacy' : 'Assign Pharmacy'}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="p-0">
                           <div className="p-2">
                               <PharmacyCombobox 
                                   initialName={order.pharmacies?.name}
                                   value={order.pharmacy_id}
                                   onAssign={(pid, pname) => handleAssignPharmacy(order.id, pid, pname)}
                                   loading={assigningId === order.id}
                                   inDropdown={true}
                               />
                           </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-sm">No orders match your criteria.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > pageSize && (
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
    </div>
  )
}

function PharmacyCombobox({ initialName, value, onAssign, loading, inDropdown }: { initialName?: string; value: number | null; onAssign: (id:number, name: string)=>void; loading:boolean; inDropdown?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{id: number, name: string}[]>([])
  const [searching, setSearching] = useState(false)
  
  // Debounce search
  useEffect(() => {
      const timer = setTimeout(async () => {
          if (open) {
              setSearching(true)
              try {
                  const data = await searchPharmacies(query)
                  setResults(data)
              } catch (e) {
                  console.error(e)
              } finally {
                  setSearching(false)
              }
          }
      }, 300)
      return () => clearTimeout(timer)
  }, [query, open])

  const display = value ? (initialName || 'Assigned') : 'Unassigned'
  
  return (
    <div className="relative w-40" onClick={(e) => inDropdown && e.stopPropagation()}>
      {!inDropdown && (
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={()=> setOpen(o=> !o)}>
            {loading ? 'Assigning...' : display}
          </Button>
      )}
      {(open || inDropdown) && (
        <div className={inDropdown ? "" : "absolute z-10 mt-1 w-full rounded border bg-popover p-2 shadow"}>
          <Input 
            placeholder="Search pharmacy..." 
            value={query} 
            onChange={e=> setQuery(e.target.value)} 
            className="mb-2 h-8 text-sm"
            autoFocus 
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {searching && <div className="text-xs text-muted-foreground px-1">Searching...</div>}
            {!searching && results.map(p => (
              <Button key={p.id} variant="ghost" size="sm" className="w-full justify-start" onClick={()=> { onAssign(p.id, p.name); setOpen(false) }}>
                {p.name}
              </Button>
            ))}
            {!searching && results.length===0 && <div className="text-xs text-muted-foreground px-1">No matches</div>}
          </div>
        </div>
      )}
    </div>
  )
}
