"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertProduct, moderateProductRequest } from "@/lib/admin-actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Package, Zap, ShieldCheck, CreditCard, Box, Image as ImageIcon, FileText, ArrowRight, Activity, Shield, Info, Loader2 } from "lucide-react";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "SKU Identity required"),
  category: z.string().min(1, "Classification required"),
  price_ghs: z.coerce.number().min(0, "Price must be positive"),
  stock_level: z.coerce.number().int().min(0, "Stock must be positive"),
  image_url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  featured: z.boolean().optional(),
  requires_prescription: z.boolean().optional(),
  is_student_product: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  categories?: any[];
  requestId?: number;
}

export function ProductSheet({
  open,
  onOpenChange,
  product,
  categories = [],
  requestId,
}: ProductSheetProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price_ghs: 0,
      stock_level: 0,
      image_url: "",
      description: "",
      featured: false,
      requires_prescription: false,
      is_student_product: false,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        image_url: product.image_url || "",
        description: product.description || "",
      });
    } else {
      form.reset({
        name: "",
        category: "",
        price_ghs: 0,
        stock_level: 0,
        image_url: "",
        description: "",
        featured: false,
        requires_prescription: false,
        is_student_product: false,
      });
    }
  }, [product, form, open]);

  async function onSubmit(data: FormValues) {
    try {
      let res: any;
      if (requestId) {
        res = await moderateProductRequest(
          requestId,
          "approved",
          "SKU provisioned via Master Control",
          data,
        );
      } else {
        res = await upsertProduct(data);
      }

      if (res.error || res.success === false) {
        toast({
          variant: "destructive",
          title: "REGISTRY_ERROR",
          description: res.error || res.message,
        });
      } else {
        toast({
          title: requestId ? "PROVISIONING_APPROVED" : "REGISTRY_SYNCHRONIZED",
          description: requestId
            ? "Node provisioning request successfully approved & mapped."
            : "Global SKU parameters synchronized across master matrix.",
        });
        onOpenChange(false);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "TERMINAL_CRITICAL",
        description: "Failed to finalize SKU registry synchronization.",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] overflow-y-auto border-none shadow-2xl p-0 transition-none bg-white scrollbar-hide">
        <div className="sticky top-0 z-30 bg-white/95 border-b border-slate-50 p-16 backdrop-blur-3xl">
          <SheetHeader className="space-y-10">
            <div className="h-24 w-24 rounded-[40px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/40">
                <Package className="h-12 w-12 text-brand-teal" />
            </div>
            <div className="space-y-4">
              <SheetTitle className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {product ? "CONFIGURE_SKU" : "PROVISION_SKU"}
              </SheetTitle>
              <div className="flex items-center gap-6">
                  <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)]" />
                  <SheetDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
                    Global catalog identity, classification & operational parameter matrix
                  </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-16 space-y-24 pb-48">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-24"
          >
            <input type="hidden" {...form.register("id")} />

            {/* Master Identity */}
            <div className="space-y-12">
               <div className="flex items-center gap-6">
                  <div className="h-3 w-3 rounded-full bg-slate-900" />
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.3em]">MASTER_IDENTITY_PROTOCOL</h4>
               </div>

               <div className="space-y-10 pl-8 border-l-4 border-slate-50">
                 <div className="grid gap-6">
                   <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                      <Zap className="h-5 w-5 text-slate-200" /> SKU Designation Identity
                   </Label>
                   <Input {...form.register("name")} placeholder="ENTER SKU MASTER DESIGNATION..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="grid gap-6">
                     <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                        <Box className="h-5 w-5 text-slate-200" /> Classification Matrix
                     </Label>
                     <Select
                       onValueChange={(val) => form.setValue("category", val)}
                       defaultValue={product?.category}
                       value={form.watch("category")}
                     >
                       <SelectTrigger className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus:ring-0 focus:bg-white shadow-sm transition-none">
                         <SelectValue placeholder="SELECT_CATEGORY_NODE" />
                       </SelectTrigger>
                       <SelectContent className="rounded-[32px] border-none shadow-2xl p-4 bg-white z-[100]">
                         {categories.map((cat) => (
                           <SelectItem key={cat.id} value={cat.name} className="text-[11px] font-black uppercase tracking-widest text-slate-500 rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-900 focus:text-white transition-none mb-1 last:mb-0">
                             {cat.name.toUpperCase()}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="grid gap-6">
                     <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                        <CreditCard className="h-5 w-5 text-slate-200" /> Global Yield (₵)
                     </Label>
                     <div className="relative group">
                        <Input type="number" step="0.01" {...form.register("price_ghs")} placeholder="0.00" className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none pr-16" />
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-sm font-black text-slate-200 group-focus-within:text-brand-teal transition-none">₵</div>
                     </div>
                   </div>
                 </div>

                 <div className="grid gap-6">
                   <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                      <Activity className="h-5 w-5 text-slate-200" /> Master Stock Registry Pulse
                   </Label>
                   <Input type="number" {...form.register("stock_level")} placeholder="ENTER UNIT COUNT..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                 </div>

                 <div className="grid gap-6">
                   <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                      <ImageIcon className="h-5 w-5 text-slate-200" /> SKU Visualization Endpoint
                   </Label>
                   <Input {...form.register("image_url")} placeholder="HTTPS://IMAGE_ASSET_CDN_PROTOCOL..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                 </div>

                 <div className="grid gap-6">
                   <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                      <FileText className="h-5 w-5 text-slate-200" /> Technical Operational Description
                   </Label>
                   <Textarea {...form.register("description")} placeholder="ENTER GRANULAR SKU PARAMETERS & DATA..." className="min-h-[200px] rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] p-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none resize-none scrollbar-hide" />
                 </div>
               </div>
            </div>

            {/* Operational Parameters */}
            <div className="space-y-12">
               <div className="flex items-center gap-6">
                  <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.3em]">OPERATIONAL_COMPLIANCE_PROTOCOL</h4>
               </div>

               <div className="pl-8 border-l-4 border-slate-50 space-y-10">
                 <div className="bg-slate-50/30 p-12 rounded-[40px] border border-slate-50 space-y-12 transition-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 hover:bg-white">
                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                             <Zap className="h-8 w-8 text-brand-teal" />
                          </div>
                          <div className="space-y-3">
                             <Label htmlFor="featured" className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 block cursor-pointer">Priority Global Placement</Label>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Broadcast in featured catalog streams.</p>
                          </div>
                       </div>
                       <Switch
                         id="featured"
                         checked={form.watch("featured")}
                         onCheckedChange={(val) => form.setValue("featured", val)}
                         className="h-10 w-20 data-[state=checked]:bg-slate-900 border-none transition-none shadow-sm"
                       />
                    </div>

                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                             <Shield className="h-8 w-8 text-rose-500" />
                          </div>
                          <div className="space-y-3">
                             <Label htmlFor="prescription" className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 block cursor-pointer">Restricted Node Protocol</Label>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Requires verified clinical prescription node.</p>
                          </div>
                       </div>
                       <Switch
                         id="prescription"
                         checked={form.watch("requires_prescription")}
                         onCheckedChange={(val) => form.setValue("requires_prescription", val)}
                         className="h-10 w-20 data-[state=checked]:bg-rose-500 border-none transition-none shadow-sm"
                       />
                    </div>

                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                             <Activity className="h-8 w-8 text-sky-500" />
                          </div>
                          <div className="space-y-3">
                             <Label htmlFor="student" className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 block cursor-pointer">Academic Concession Stream</Label>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Eligible for verified student-tier liquidity.</p>
                          </div>
                       </div>
                       <Switch
                         id="student"
                         checked={form.watch("is_student_product")}
                         onCheckedChange={(val) => form.setValue("is_student_product", val)}
                         className="h-10 w-20 data-[state=checked]:bg-sky-500 border-none transition-none shadow-sm"
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-6 pl-6">
                    <Info className="h-5 w-5 text-brand-teal" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                       Operational parameters impact global SKU visibility, fulfillment routing & node accessibility protocols within the master matrix.
                    </p>
                 </div>
               </div>
            </div>

            <SheetFooter className="pt-24 pb-16 border-t border-slate-50">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isPending}
                className="w-full h-24 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-base uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/40 transition-none border-none gap-10"
              >
                {form.formState.isSubmitting || isPending
                  ? <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
                  : product ? "UPDATE_GLOBAL_SKU_REGISTRY" : "CONFIRM_SKU_PROVISIONING_EXECUTE"}
                {!form.formState.isSubmitting && !isPending && <ArrowRight className="h-8 w-8 text-brand-teal" />}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
