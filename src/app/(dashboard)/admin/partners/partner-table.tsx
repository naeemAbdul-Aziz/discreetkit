"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Search, Trash2, Edit, MapPin, Phone, User, UserCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { PartnerSheet } from "./partner-sheet"
import { deletePharmacy } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"

interface Pharmacy {
  id: number
  name: string
  location: string
  contact_person: string | null
  phone_number: string | null
  email: string | null
  user: { id: string; email: string } | null
}

export function PartnerTable({ initialPartners }: { initialPartners: Pharmacy[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Pharmacy | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()
  const router = useRouter()

  const filteredPartners = initialPartners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / pageSize))
  const paginatedPartners = filteredPartners.slice((page-1)*pageSize, page*pageSize)

  const handleEdit = (partner: Pharmacy) => {
    setSelectedPartner(partner)
    setIsSheetOpen(true)
  }

  const handleAdd = () => {
    setSelectedPartner(null)
    setIsSheetOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner?")) return
    
    const res = await deletePharmacy(id)
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Deleted", description: "Partner removed." })
      router.refresh() // Refresh to show changes
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search partners..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>User Account</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPartners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-medium">
                  {partner.name}
                  {partner.email && (
                    <div className="text-xs text-muted-foreground">{partner.email}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {partner.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{partner.contact_person || '-'}</span>
                    {partner.phone_number && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {partner.phone_number}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {partner.user ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="gap-1">
                        <UserCheck className="h-3 w-3" />
                        Linked
                      </Badge>
                      <span className="text-xs text-muted-foreground">{partner.user.email}</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <User className="h-3 w-3" />
                      No Account
                    </Badge>
                  )}
                </TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(partner)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(partner.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredPartners.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No partners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredPartners.length > pageSize && (
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

      <PartnerSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        partner={selectedPartner} 
      />
    </div>
  )
}
