
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Package, AlertTriangle } from "lucide-react";
import { toggleProductAvailability, updateProductStock, requestNewProduct } from "@/lib/pharmacy-actions";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: number;
  name: string;
  category: string | null;
  price_ghs: number;
  image_url: string | null;
  is_available: boolean;
  custom_stock: number;
  custom_price: number;
  requires_prescription: boolean;
}

interface InventoryClientProps {
  products: Product[];
  pharmacyId: number | null;
}

export default function InventoryClient({ products, pharmacyId }: InventoryClientProps) {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggle = async (productId: number, currentState: boolean) => {
    if (!pharmacyId) return;
    
    setLoadingMap(prev => ({ ...prev, [productId]: true }));
    
    const res = await toggleProductAvailability(pharmacyId, productId, !currentState);
    
    if (!res.success) {
      toast({ variant: "destructive", title: "Update failed", description: res.error });
    } else {
        toast({ title: currentState ? "Marked Unavailable" : "Marked Available" });
    }
    
    setLoadingMap(prev => ({ ...prev, [productId]: false }));
  };
  
  const handleStockUpdate = async (productId: number, stock: string) => {
     if (!pharmacyId) return;
     const numStock = parseInt(stock);
     if (isNaN(numStock)) return;
     
     await updateProductStock(pharmacyId, productId, numStock);
  }

  if (!pharmacyId) {
    return <div className="p-4 text-red-500">Error: Pharmacy profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Request New Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request New Product</DialogTitle>
              <DialogDescription>
                Can't find what you're looking for? Suggest a product to be added to the global catalog.
              </DialogDescription>
            </DialogHeader>
            <form action={async (formData) => {
                const res = await requestNewProduct(null, formData);
                if (res.success) {
                    toast({ title: "Request Submitted", description: res.message });
                    setIsRequestOpen(false);
                } else {
                    toast({ variant: "destructive", title: "Error", description: res.message });
                }
            }} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input id="productName" name="productName" placeholder="e.g. Vitamin C 1000mg" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" name="description" placeholder="Additional details, brand preference, etc." />
                </div>
                <DialogFooter>
                    <Button type="submit">Submit Request</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 flex flex-col gap-4 overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 bg-muted rounded-md overflow-hidden shrink-0">
                {product.image_url ? (
                   <Image 
                     src={product.image_url} 
                     alt={product.name}
                     fill
                     className="object-cover"
                   />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-8 w-8 opacity-20" />
                    </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate pr-2" title={product.name}>{product.name}</h3>
                    {product.requires_prescription && (
                         <span title="Requires Prescription" className="shrink-0 text-amber-500 mt-0.5">
                             <AlertTriangle className="h-4 w-4" />
                         </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{product.category || 'General'}</p>
                <div className="mt-2 flex items-center gap-2">
                   <div className="text-sm font-medium">GHS {product.custom_price || product.price_ghs}</div>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Switch 
                        checked={product.is_available} 
                        onCheckedChange={() => handleToggle(product.id, product.is_available)}
                        disabled={loadingMap[product.id]}
                    />
                    <span className={`text-sm ${product.is_available ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                        {product.is_available ? 'In Stock' : 'Unavailable'}
                    </span>
                </div>
                
                {product.is_available && (
                    <div className="flex items-center gap-2">
                         <span className="text-xs text-muted-foreground">Qty:</span>
                         <Input 
                            type="number" 
                            className="h-8 w-16 text-center" 
                            defaultValue={product.custom_stock}
                            onBlur={(e) => handleStockUpdate(product.id, e.target.value)}
                         />
                    </div>
                )}
            </div>
          </Card>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No products found matching "{search}"</p>
          </div>
      )}
    </div>
  );
}
