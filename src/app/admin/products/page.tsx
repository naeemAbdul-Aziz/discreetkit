/**
 * @file page.tsx
 * @description The main page for managing products in the admin dashboard.
 *              It fetches and displays all products in a sortable, searchable table.
 */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getAdminProducts, getProductById } from '@/lib/actions';
import type { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal, ArrowUpDown, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProductForm } from './(components)/product-form';

type SortableColumn = 'name' | 'category' | 'price_ghs' | 'stock_level';
type SortDirection = 'asc' | 'desc';

// A reusable component for sortable table headers
const SortableHeader = ({
  column,
  label,
  currentSort,
  onSort,
}: {
  column: SortableColumn;
  label: string;
  currentSort: { column: SortableColumn; direction: SortDirection };
  onSort: (column: SortableColumn) => void;
}) => (
  <TableHead onClick={() => onSort(column)} className="cursor-pointer hover:bg-muted/50">
    <div className="flex items-center gap-2">
      {label}
      {currentSort.column === column && <ArrowUpDown className="h-4 w-4" />}
    </div>
  </TableHead>
);

const StockBadge = ({ stock_level }: { stock_level: number }) => {
    let variant: 'destructive' | 'accent' | 'default' = 'default';
    if (stock_level < 10) {
        variant = 'destructive';
    } else if (stock_level <= 20) {
        variant = 'accent';
    }

    return (
        <Badge variant={variant} className="w-16 justify-center">
            {stock_level}
        </Badge>
    );
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sort, setSort] = useState<{ column: SortableColumn, direction: SortDirection }>({ column: 'name', direction: 'asc' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const fetchProducts = async () => {
    setIsLoading(true);
    const fetchedProducts = await getAdminProducts();
    setProducts(fetchedProducts);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSort = (column: SortableColumn) => {
    setSort(prevSort => ({
      column,
      direction: prevSort.column === column && prevSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleEdit = async (productId: number) => {
    const product = await getProductById(productId);
    if (product) {
      setSelectedProduct(product);
      setIsFormOpen(true);
    }
  }

  const handleAddNew = () => {
      setSelectedProduct(undefined);
      setIsFormOpen(true);
  }

  const onFormSubmit = () => {
    setIsFormOpen(false);
    fetchProducts(); // Re-fetch products to show the latest changes
  }

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'All' || product.category === categoryFilter)
      )
      .sort((a, b) => {
        const aValue = a[sort.column];
        const bValue = b[sort.column];

        if (aValue === null || bValue === null) return 0;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        } else {
            comparison = String(aValue).localeCompare(String(bValue));
        }

        return sort.direction === 'asc' ? comparison : -comparison;
      });
  }, [products, searchTerm, categoryFilter, sort]);


  const renderTableBody = () => {
    if (isLoading) {
        return (
            <>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-12 w-12 rounded-md" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                             <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                    </TableRow>
                ))}
            </>
        )
    }

    return filteredAndSortedProducts.map((product) => (
        <TableRow key={product.id}>
        <TableCell className="hidden sm:table-cell">
            {product.image_url ? (
            <div className="relative h-12 w-12 rounded-md bg-muted overflow-hidden">
                <img
                    alt={product.name ?? 'Product image'}
                    className="object-contain w-full h-full"
                    src={product.image_url}
                />
            </div>
            ) : (
            <div className="h-12 w-12 rounded-md bg-muted" />
            )}
        </TableCell>
        <TableCell className="font-medium">{product.name}</TableCell>
        <TableCell>
            <Badge variant="outline">{product.category}</Badge>
        </TableCell>
        <TableCell>{product.price_ghs.toFixed(2)}</TableCell>
        <TableCell>
            <StockBadge stock_level={product.stock_level} />
        </TableCell>
        <TableCell>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(product.id)}>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
        </TableRow>
    ))
  }

  return (
    <>
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                    Manage your product inventory.
                </CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
                 <div className="relative w-full sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add New</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                Image
              </TableHead>
              <SortableHeader column="name" label="Name" currentSort={sort} onSort={handleSort} />
              <SortableHeader column="category" label="Category" currentSort={sort} onSort={handleSort} />
              <SortableHeader column="price_ghs" label="Price (GHS)" currentSort={sort} onSort={handleSort} />
              <SortableHeader column="stock_level" label="Stock" currentSort={sort} onSort={handleSort} />
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                    {selectedProduct ? 'Update the details of this product.' : 'Fill out the form to add a new product.'}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <ProductForm product={selectedProduct} onFormSubmit={onFormSubmit} />
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
