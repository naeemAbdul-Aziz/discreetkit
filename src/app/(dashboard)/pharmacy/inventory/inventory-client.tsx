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
  Clock,
  Terminal,
  Zap,
  Activity,
  Repeat,
  ShieldCheck,
  ShieldAlert
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
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
    {items.map((product) => {
      const isOutOfStock = !product.is_available || product.custom_stock === 0;
      const isLowStock = product.is_available && product.custom_stock > 0 && product.custom_stock < 5;

      return (
        <Card
          key={product.id}
          className={cn(
            "group relative flex flex-col overflow-hidden border-slate-100 transition-none hover:border-slate-300 bg-white rounded-3xl shadow-2xl shadow-slate-900/5",
            isOutOfStock && "opacity-80"
          )}
        >
          {/* Image Section */}
          <div className={cn(
            "relative aspect-square bg-slate-50 transition-none overflow-hidden",
            isOutOfStock && "grayscale contrast-75 bg-slate-100"
          )}>
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover transition-none"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50">
                <Package className="h-16 w-16 opacity-30" />
              </div>
            )}
            
            {/* Prescription Badge */}
            {product.requires_prescription && (
              <div className="absolute top-4 left-4 bg-amber-50/90 backdrop-blur-xl border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl shadow-amber-500/10">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest">Rx_Required</span>
              </div>
            )}

            {/* Availability Toggle - Always visible for ease of use */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
               <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100">
                  <Switch
                    checked={product.is_available}
                    onCheckedChange={() => onToggle(product.id, product.is_available)}
                    disabled={loadingMap[product.id]}
                    className="data-[state=checked]:bg-brand-teal scale-90 transition-none"
                  />
               </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 flex flex-col flex-1 space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-teal leading-none">{product.category?.toUpperCase() || "GENERAL"}</p>
              <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-none uppercase tracking-tight" title={product.name}>
                {product.name}
              </h3>
            </div>

            <div className="flex items-center justify-between">
               <div className="text-xl font-black text-slate-900 tabular-nums leading-none tracking-tighter">
                 ₵{(product.custom_price || product.price_ghs).toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </div>
               {isLowStock && (
                  <div className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest shadow-sm">LOW_STOCK</div>
               )}
               {isOutOfStock && (
                  <div className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest shadow-sm">SOLD_OUT</div>
               )}
            </div>

            {product.is_available && (
               <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm transition-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 shrink-0 leading-none">QTY_LEVEL:</span>
                  <Input 
                    type="number" 
                    className="h-10 bg-transparent border-none text-right font-black text-slate-900 focus-visible:ring-0 px-2 text-sm tabular-nums transition-none"
                    defaultValue={product.custom_stock}
                    onBlur={(e) => onStockUpdate(product.id, e.target.value)}
                  />
               </div>
            )}
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
        title: "PROTOCOL_FAILURE",
        description: res.error,
      });
    } else {
      toast({
        title: currentState ? "NODE_DEACTIVATED" : "NODE_ACTIVATED",
        description: currentState ? "Stream unassigned from fulfillment matrix." : "Node synchronized with active catalog.",
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
      <div className="p-20 text-center text-rose-500 bg-rose-50/50 rounded-3xl border border-rose-100 font-black uppercase tracking-[0.2em] text-xs">
        OPERATIONAL_ERROR: Pharmacy node profile not detected in registry.
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col xl:flex-row items-center gap-10 bg-slate-50/50 p-2.5 rounded-3xl border border-slate-100 transition-none shadow-sm">
        <div className="relative flex-1 w-full group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-brand-teal transition-none" />
            <Input 
                type="text" 
                placeholder="PROTOCOL SEARCH: FILTER INVENTORY MATRIX..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-16 pl-20 pr-10 rounded-2xl border-none bg-white text-[11px] font-black uppercase tracking-[0.2em] placeholder:text-slate-200 transition-none focus-visible:ring-0 shadow-sm"
            />
        </div>
        <div className="flex items-center gap-4 px-2">
            <Button 
                onClick={() => setIsRequestOpen(true)}
                className="h-16 px-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest gap-5 shadow-2xl shadow-slate-900/20 transition-none border-none"
            >
                <Plus className="h-6 w-6 text-brand-teal" />
                SYNC_NEW_PRODUCT
            </Button>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-16">
        <div className="flex items-center justify-center lg:justify-start">
            <TabsList className="bg-slate-50 p-2.5 rounded-full h-20 border border-slate-100 gap-3 shadow-sm">
                <TabsTrigger 
                    value="catalog" 
                    className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
                >
                    ACTIVE_CATALOG
                </TabsTrigger>
                <TabsTrigger 
                    value="low-stock" 
                    className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
                >
                    LOW_STOCK_NODES
                    {lowStockProducts.length > 0 && (
                        <span className="ml-5 h-6 min-w-[1.5rem] px-2.5 flex items-center justify-center rounded-full bg-brand-teal text-white text-[10px] font-black shadow-2xl shadow-brand-teal/20">
                            {lowStockProducts.length}
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger 
                    value="requests" 
                    className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
                >
                    REGISTRY_REQUESTS
                    {requests.filter((r) => r.status === "pending").length > 0 && (
                        <span className="ml-5 h-6 min-w-[1.5rem] px-2.5 flex items-center justify-center rounded-full bg-brand-teal text-white text-[10px] font-black shadow-2xl shadow-brand-teal/20">
                            {requests.filter((r) => r.status === "pending").length}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="catalog" className="outline-none focus-visible:outline-none">
          <ProductGrid 
            items={filteredProducts} 
            loadingMap={loadingMap} 
            onToggle={handleToggle} 
            onStockUpdate={handleStockUpdate} 
          />
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-80 bg-slate-50/20 rounded-3xl border border-dashed border-slate-100">
              <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-slate-900/5">
                 <ShieldAlert className="h-16 w-16 text-slate-100" />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Matrix Scan Nominal</h3>
              <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] mt-6 max-w-md mx-auto leading-relaxed text-center">
                No protocol violations or matching products detected in the current terminal node search scope. Re-initialize terminal filters to refresh registry feed.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="low-stock" className="outline-none focus-visible:outline-none">
           <ProductGrid 
            items={lowStockProducts} 
            loadingMap={loadingMap} 
            onToggle={handleToggle} 
            onStockUpdate={handleStockUpdate} 
          />
           {lowStockProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-80 bg-emerald-50/10 rounded-3xl border border-dashed border-emerald-100">
               <div className="h-32 w-32 rounded-3xl bg-white border border-emerald-100 flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-emerald-500/5">
                  <CheckCircle2 className="h-16 w-16 text-emerald-100" />
               </div>
               <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Inventory Healthy</h3>
               <p className="text-[11px] font-black text-emerald-400/60 uppercase tracking-[0.25em] mt-6 max-w-md mx-auto leading-relaxed text-center">
                 All active fulfillment nodes are currently above critical stock thresholds. Matrix integrity at 100%.
               </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="outline-none focus-visible:outline-none">
            <div className="grid gap-8">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-60 bg-slate-50/20 rounded-3xl border border-dashed border-slate-100">
                  <div className="h-24 w-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-900/5">
                    <History className="h-12 w-12 text-slate-100" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No registry synchronization requests.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <Card key={req.id} className="p-12 border-slate-100 bg-white rounded-3xl shadow-2xl shadow-slate-900/5 group/req transition-none">
                    <div className="flex flex-col md:flex-row justify-between gap-10 md:items-center">
                       <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-6">
                             <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{req.product_name}</h4>
                             <div className={cn(
                                "px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm",
                                req.status === "approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                req.status === "rejected" ? "bg-rose-50 text-rose-500 border border-rose-100" : 
                                "bg-slate-50 text-slate-400 border border-slate-100"
                             )}>
                                {req.status === "pending" ? "PENDING_SYNC" : req.status === "approved" ? "NODE_ADDED" : "SYNC_DECLINED"}
                             </div>
                          </div>
                          {req.description && <p className="text-sm font-black text-slate-500 uppercase tracking-tight line-clamp-1 leading-none">{req.description.toUpperCase()}</p>}
                          <div className="flex items-center gap-4">
                             <div className="h-10 px-6 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-3 shadow-sm">
                                <Clock className="h-4 w-4 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SUBMITTED: {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                             </div>
                             <div className="h-1 w-8 bg-slate-100 rounded-full" />
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">ID_HEX: #{req.id.toString(16).toUpperCase()}</span>
                          </div>
                       </div>
                       
                       {req.admin_notes && (
                          <div className="md:max-w-md w-full bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group-hover/req:bg-brand-teal/5 group-hover/req:border-brand-teal/20 transition-none shadow-sm">
                             <div className="flex items-center gap-3 mb-4">
                                <Info className="h-4 w-4 text-brand-teal" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal leading-none">Command Response</span>
                             </div>
                             <p className="text-[12px] font-black text-slate-600 leading-relaxed uppercase tracking-tight italic">
                                &quot;{req.admin_notes.toUpperCase()}&quot;
                             </p>
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
      toast({ 
        title: "REQUEST_LOGGED", 
        description: "Node synchronization request successfully added to root queue." 
      });
      onOpenChange(false);
    } else {
      toast({ 
        variant: "destructive", 
        title: "PROTOCOL_FAILURE", 
        description: res.message 
      });
    }
    setLoading(false);
  };

  const Content = (
    <form action={handleSubmit} className="space-y-10 pt-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="productName" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Product Designation</Label>
          <Input 
            id="productName" 
            name="productName" 
            placeholder="E.G. LIPITOR_20MG_TABLETS" 
            required 
            className="h-16 border-none bg-slate-50/50 rounded-2xl font-black text-[11px] uppercase tracking-widest px-8 shadow-sm focus-visible:ring-0" 
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Technical Specifications (Optional)</Label>
          <Textarea 
            id="description" 
            name="description" 
            placeholder="SPECIFY_BRAND_PREFERENCE_DOSAGE_FORM_OR_PACKAGING..." 
            className="min-h-[160px] border-none bg-slate-50/50 rounded-3xl font-black text-[12px] uppercase tracking-widest px-8 py-8 leading-relaxed resize-none shadow-sm focus-visible:ring-0" 
          />
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 space-y-5 shadow-2xl transition-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-teal/5 rounded-bl-full -mr-10 -mt-10" />
        <div className="flex items-center gap-4">
            <Zap className="h-5 w-5 text-brand-teal" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] leading-none">Registry Synchronization</p>
        </div>
        <p className="text-[12px] text-slate-300 leading-relaxed font-black uppercase tracking-tight">
          New product requests trigger a root catalog audit. If approved, the node will be provisioned in the <span className="text-white">ACTIVE_CATALOG</span> within 24 operational frames.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-slate-50">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest order-2 sm:order-1 text-slate-400 hover:bg-slate-50 transition-none border-none shadow-sm"
        >
          Cancel_Request
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-slate-900 hover:bg-slate-800 text-white w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest order-1 sm:order-2 shadow-2xl shadow-slate-900/30 transition-none border-none gap-5"
        >
          {loading ? (
            "SYNCHRONIZING..."
          ) : (
            <>
              <ShieldCheck className="h-6 w-6 text-brand-teal" />
              Confirm_Submission
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] bg-white border-none rounded-t-[40px] transition-none outline-none">
          <div className="flex flex-col h-full w-full max-w-xl mx-auto px-12 pb-16 overflow-y-auto">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-6 mb-10" />
            <DrawerHeader className="px-0 pt-4 text-left shrink-0 space-y-6">
              <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                <Repeat className="h-10 w-10 text-brand-teal" />
              </div>
              <div className="space-y-4">
                <DrawerTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sync New Product</DrawerTitle>
                <DrawerDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2">
                    Request a node to be added to the global catalog.
                </DrawerDescription>
              </div>
            </DrawerHeader>
            <div className="flex-1 pb-6">{Content}</div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-[40px] border-none shadow-2xl p-16 bg-white transition-none outline-none">
        <DialogHeader className="space-y-10">
          <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
            <Repeat className="h-10 w-10 text-brand-teal" />
          </div>
          <div className="space-y-4">
            <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sync New Product</DialogTitle>
            <DialogDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2">
                Request a node to be added to the global catalog.
            </DialogDescription>
          </div>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  )
}
