/**
 * @file page.tsx
 * @description The main page for managing pharmacy partners in the admin dashboard.
 */
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getAdminPharmacies, deletePharmacy } from '@/lib/actions';
import type { Pharmacy } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal, ArrowUpDown, Search, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PharmacyForm } from './(components)/pharmacy-form';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | undefined>(undefined);
  const { toast } = useToast();

  const fetchPharmacies = useCallback(async () => {
    setIsLoading(true);
    const fetchedPharmacies = await getAdminPharmacies();
    setPharmacies(fetchedPharmacies);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const handleEdit = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsFormOpen(true);
  }

  const handleAddNew = () => {
    setSelectedPharmacy(undefined);
    setIsFormOpen(true);
  }

  const onFormSubmit = () => {
    setIsFormOpen(false);
    fetchPharmacies();
  }
  
  const handleDelete = async (pharmacyId: number) => {
    const result = await deletePharmacy(pharmacyId);
    if (result.success) {
        toast({ title: "Pharmacy Deleted", description: "The pharmacy partner has been removed." });
        fetchPharmacies();
    } else {
        toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
    }
  }

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pharmacies, searchTerm]);

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ));
    }
    
    if (filteredPharmacies.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            No pharmacy partners found.
          </TableCell>
        </TableRow>
      );
    }

    return filteredPharmacies.map((pharmacy) => (
      <TableRow key={pharmacy.id}>
        <TableCell className="font-medium">{pharmacy.name}</TableCell>
        <TableCell>{pharmacy.location}</TableCell>
        <TableCell>{pharmacy.contact_person || 'N/A'}</TableCell>
        <TableCell>{pharmacy.phone_number || 'N/A'}</TableCell>
        <TableCell>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(pharmacy)}>Edit Details</DropdownMenuItem>
                         <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pharmacy
                            and unassign them from any orders.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(pharmacy.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pharmacy Partners</h1>
          <p className="text-muted-foreground">
            Manage your network of fulfillment partners.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Partner
        </Button>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPharmacy ? 'Edit Pharmacy Partner' : 'Add New Pharmacy Partner'}</DialogTitle>
            <DialogDescription>
              {selectedPharmacy ? 'Update the details for this partner.' : 'Fill out the form to add a new fulfillment partner.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PharmacyForm pharmacy={selectedPharmacy} onFormSubmit={onFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    