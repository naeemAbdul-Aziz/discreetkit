"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Package, 
  AlertTriangle, 
  Plus, 
  LayoutGrid, 
  History,
  TrendingDown,
  Info,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  toggleProductAvailability,
  updateProductStock,
  requestNewProduct,
} from "@/lib/pharmacy-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

interface ProductRequest {
  id: number;
  product_name: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
}

interface InventoryClientProps {
  products: Product[];
  pharmacyId: number | null;
  requests: ProductRequest[];
}

// Extract ProductGrid to top-level to avoid re-creation on every render (ESLint fix)
const ProductGrid = ({ 
  items, 
  loadingMap, 
  onToggle, 
  onStockUpdate 
}: { 
  items: Product[], 
  loadingMap: Record<number, boolean>,
  onToggle: (id: number, current: boolean) => void,
  onStockUpdate: (id: number, stock: string) => void
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {items.map((product) => {
      const isOutOfStock = !product.is_available || product.custom_stock === 0;
      const isLowStock = product.is_available && product.custom_stock > 0 && product.custom_stock < 5;

      return (
        <Card
          key={product.id}
          className={cn(
            "group relative flex flex-col overflow-hidden border-slate-200 transition-all hover:shadow-xl hover:border-slate-300 bg-white rounded-2xl",
            isOutOfStock && "opacity-80"
          )}
        >
          {/* Image Section */}
          <div className={cn(
            "relative aspect-square bg-slate-50 transition-all duration-500 overflow-hidden",
            isOutOfStock && "grayscale contrast-75 bg-slate-100"
          )}>
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300">
                <Package className="h-10 w-10 opacity-30" />
              </div>
            )}
            
            {/* Prescription Badge */}
            {product.requires_prescription && (
              <div className="absolute top-2 left-2 bg-amber-50/90 backdrop-blur-sm border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">Rx Required</span>
              </div>
            )}

            {/* Availability Toggle - Floating overlay on desktop */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3 w-full scale-90 group-hover:scale-100 transition-transform">
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl w-full justify-between border border-slate-100">
                     <span className="text-[11px] font-bold text-slate-500 capitalize">In Stock</span>
                     <Switch
                        checked={product.is_available}
                        onCheckedChange={() => onToggle(product.id, product.is_available)}
                        disabled={loadingMap[product.id]}
                        className="data-[state=checked]:bg-brand-teal"
                      />
                  </div>
                  {product.is_available && (
                     <div className="w-full space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Inventory Qty</label>
                        <Input 
                          type="number" 
                          className="h-10 text-center font-mono font-black text-lg border-slate-200 focus:ring-brand-teal"
                          defaultValue={product.custom_stock}
                          onBlur={(e) => onStockUpdate(product.id, e.target.value)}
                        />
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 flex flex-col flex-1">
            <div className="mb-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal mb-1">{product.category || "General"}</p>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-brand-teal transition-colors" title={product.name}>
                {product.name}
              </h3>
            </div>

            <div className="flex items-center justify-between mt-4">
               <div className="text-lg font-black text-slate-900 tabular-nums">
                 ₵{(product.custom_price || product.price_ghs).toFixed(2)}
               </div>
               {isLowStock && (
                  <Badge variant="warning" className="animate-pulse bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black tracking-tighter py-0 px-2 h-5">LOW STOCK</Badge>
               )}
               {isOutOfStock && (
                  <Badge variant="neutral" className="bg-slate-100 text-slate-400 border-slate-200 text-[10px] font-black tracking-tighter py-0 px-2 h-5">SOLDOUT</Badge>
               )}
            </div>
          </div>
        </Card>
      );
    })}
  </div>
);

export default function InventoryClient({
  products,
  pharmacyId,
  requests = [],
}: InventoryClientProps) {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase())),
  );

  const lowStockProducts = filteredProducts.filter(p => p.is_available && p.custom_stock < 5);

  const handleToggle = async (productId: number, currentState: boolean) => {
    if (!pharmacyId) return;

    setLoadingMap((prev) => ({ ...prev, [productId]: true }));

    const res = await toggleProductAvailability(
      pharmacyId,
      productId,
      !currentState,
    );

    if (!res.success) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: res.error,
      });
    } else {
      toast({
        title: currentState ? "Marked Unavailable" : "Marked Available",
      });
    }

    setLoadingMap((prev) => ({ ...prev, [productId]: false }));
  };

  const handleStockUpdate = async (productId: number, stock: string) => {
    if (!pharmacyId) return;
    const numStock = parseInt(stock);
    if (isNaN(numStock)) return;

    await updateProductStock(pharmacyId, productId, numStock);
  };

  if (!pharmacyId) {
    return (
      <div className="p-12 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 font-bold">
        Error: Pharmacy profile not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-slate-900">Product Inventory</h1>
           <p className="text-slate-500 font-medium mt-1">Real-time stock management and global catalog integration.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Filter by name or therapeutic class..."
              className="pl-10 h-12 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-brand-teal font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button 
            className="h-12 px-6 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark font-black text-sm gap-2 shrink-0 shadow-lg shadow-brand-indigo/20 transition-all active:scale-95"
            onClick={() => setIsRequestOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Request Product</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 border border-slate-100">
          <TabsTrigger value="catalog" className="rounded-xl px-8 h-full gap-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-brand-teal">
            <LayoutGrid className="h-4 w-4" />
            Live Catalog
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="rounded-xl px-8 h-full gap-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600">
            <TrendingDown className="h-4 w-4" />
            Low Stock
            {lowStockProducts.length > 0 && (
              <Badge className="ml-1 px-1.5 py-0 rounded-lg bg-amber-100 text-amber-700 border-none font-black text-[10px]">{lowStockProducts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-xl px-8 h-full gap-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-brand-indigo">
            <History className="h-4 w-4" />
            Sync Requests
            {requests.filter((r) => r.status === "pending").length > 0 && (
              <Badge className="ml-1 px-1.5 py-0 rounded-lg bg-brand-indigo/10 text-brand-indigo border-none font-black text-[10px]">
                {requests.filter((r) => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="animate-in slide-in-from-bottom-4 duration-500">
          <ProductGrid 
            items={filteredProducts} 
            loadingMap={loadingMap} 
            onToggle={handleToggle} 
            onStockUpdate={handleStockUpdate} 
          />
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Package className="h-16 w-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
              <p className="text-slate-400 max-w-xs mt-2 font-medium">We couldn&apos;t find any products matching &quot;{search}&quot; in your catalog.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="low-stock" className="animate-in slide-in-from-bottom-4 duration-500">
           <ProductGrid 
            items={lowStockProducts} 
            loadingMap={loadingMap} 
            onToggle={handleToggle} 
            onStockUpdate={handleStockUpdate} 
          />
           {lowStockProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-teal-50/50 rounded-3xl border-2 border-dashed border-teal-100">
              <CheckCircle2 className="h-16 w-16 text-emerald-200 mb-4" />
              <h3 className="text-xl font-bold text-emerald-900">Inventory Healthy</h3>
              <p className="text-emerald-600/60 max-w-xs mt-2 font-medium">All active items are currently above the critical stock threshold.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <History className="h-12 w-12 text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold">No synchronization requests.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <Card key={req.id} className="p-6 border-slate-100 hover:border-brand-indigo/20 transition-all rounded-2xl group shadow-sm bg-white">
                    <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
                       <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                             <h4 className="text-lg font-black text-slate-900 tracking-tight">{req.product_name}</h4>
                             <Badge variant={req.status === "approved" ? "success" : req.status === "rejected" ? "destructive" : "secondary"} className="px-3 py-0.5 rounded-lg font-black text-[10px] uppercase tracking-widest">
                                {req.status === "pending" ? "Awaiting Review" : req.status === "approved" ? "Added to Inventory" : "Declined"}
                             </Badge>
                          </div>
                          {req.description && <p className="text-sm font-medium text-slate-500 line-clamp-1">{req.description}</p>}
                          <p className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-wider mt-2">
                             <Clock className="h-3 w-3" /> Submitted {new Date(req.created_at).toLocaleDateString()}
                          </p>
                       </div>
                       
                       {req.admin_notes && (
                          <div className="md:max-w-md w-full bg-slate-50 p-4 rounded-xl border border-slate-100 relative group-hover:bg-brand-indigo/5 group-hover:border-brand-indigo/10 transition-colors">
                             <div className="flex items-center gap-2 mb-2">
                                <Info className="h-3.5 w-3.5 text-brand-indigo" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-indigo">Direct Response</span>
                             </div>
                             <p className="text-xs font-medium text-slate-600 leading-relaxed italic">{req.admin_notes}</p>
                          </div>
                       )}
                    </div>
                  </Card>
                ))
              )}
            </div>
        </TabsContent>
      </Tabs>

      {/* Global Product Request Modals */}
      <ProductRequestModal 
        open={isRequestOpen} 
        onOpenChange={setIsRequestOpen} 
        isMobile={isMobile}
        toast={toast}
      />
    </div>
  );
}

function ProductRequestModal({ open, onOpenChange, isMobile, toast }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await requestNewProduct(null, formData);
    if (res.success) {
      toast({ title: "Request Submitted", description: res.message });
      onOpenChange(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: res.message });
    }
    setLoading(false);
  };

  const Content = (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Product Identity</Label>
          <Input id="productName" name="productName" placeholder="e.g. Lipitor 20mg Tablets" required className="h-12 border-slate-200 rounded-xl font-bold" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Clinical Context (Optional)</Label>
          <Textarea id="description" name="description" placeholder="Specify brand preference, dosage form, or packaging requirements..." className="min-h-[120px] border-slate-200 rounded-xl font-medium" />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-brand-indigo hover:bg-brand-indigo-dark font-black text-sm gap-2">
        {loading ? "Transmitting..." : "Send Synchronization Request"}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="p-6 h-[70vh]">
          <DrawerHeader className="px-0">
             <DrawerTitle className="text-2xl font-black">Sync New Product</DrawerTitle>
             <DrawerDescription className="font-medium">Request an item to be added to the DiscreetKit global catalog.</DrawerDescription>
          </DrawerHeader>
          <div className="mt-4">{Content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8 rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Sync New Product</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">Suggest a medication or health product to be added to our validated catalog.</DialogDescription>
        </DialogHeader>
        <div className="mt-6">{Content}</div>
      </DialogContent>
    </Dialog>
  )
}
