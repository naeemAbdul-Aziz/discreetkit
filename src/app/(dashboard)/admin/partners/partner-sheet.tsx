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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertPharmacy, createPharmacyWithUser } from "@/lib/admin-actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { User, ShieldCheck, Landmark, Smartphone, Zap, Network, CreditCard, Key, MapPin, Activity, Terminal, ArrowRight, Activity as ActivityIcon, Info, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Identity required"),
  location: z.string().min(1, "Location required"),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  user_email: z.string().email().optional().or(z.literal("")),
  user_password: z
    .string()
    .min(6, "Complexity insufficient")
    .optional()
    .or(z.literal("")),
  partner_code: z.string().optional(),
  trade_discount_percentage: z.coerce.number().min(0).max(100).default(20),
  bank_details: z
    .object({
      bank_name: z.string().optional(),
      account_number: z.string().optional(),
      account_name: z.string().optional(),
      branch: z.string().optional(),
    })
    .optional(),
  momo_details: z
    .object({
      network: z.string().optional(),
      number: z.string().optional(),
      account_name: z.string().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: any;
}

export function PartnerSheet({
  open,
  onOpenChange,
  partner,
}: PartnerSheetProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showUserFields, setShowUserFields] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      contact_person: "",
      phone_number: "",
      email: "",
      user_email: "",
      user_password: "",
      trade_discount_percentage: 20,
      bank_details: {
        bank_name: "",
        account_number: "",
        account_name: "",
        branch: "",
      },
      momo_details: { network: "", number: "", account_name: "" },
    },
  });

  useEffect(() => {
    if (partner) {
      form.reset({
        ...partner,
        contact_person: partner.contact_person || "",
        phone_number: partner.phone_number || "",
        email: partner.email || "",
        user_email: "",
        user_password: "",
        trade_discount_percentage: partner.trade_discount_percentage || 20,
        bank_details: partner.bank_details || {
          bank_name: "",
          account_number: "",
          account_name: "",
          branch: "",
        },
        momo_details: partner.momo_details || {
          network: "",
          number: "",
          account_name: "",
        },
      });
      setShowUserFields(false);
    } else {
      form.reset({
        name: "",
        location: "",
        contact_person: "",
        phone_number: "",
        email: "",
        user_email: "",
        user_password: "",
        trade_discount_percentage: 20,
        bank_details: {
          bank_name: "",
          account_number: "",
          account_name: "",
          branch: "",
        },
        momo_details: { network: "", number: "", account_name: "" },
      });
      setShowUserFields(false);
    }
  }, [partner, form]);

  async function onSubmit(data: FormValues) {
    try {
      let res;
      if (!data.id && data.user_email && data.user_password) {
        res = await createPharmacyWithUser(data);
      } else if (data.id && data.user_email && data.user_password) {
        await upsertPharmacy(data);
        res = await import("@/lib/admin-actions").then((mod) =>
          mod.linkPharmacyUser(data.id!, data.user_email!, data.user_password!),
        );
      } else {
        res = await upsertPharmacy(data);
      }

      if (res?.error) {
        toast({
          variant: "destructive",
          title: "SYNC_ERROR",
          description: res.error,
        });
      } else {
        toast({ title: "REGISTRY_SYNCHRONIZED", description: "Node parameters mapped successfully to master directory." });
        onOpenChange(false);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "TERMINAL_CRITICAL",
        description: error.message || "Failed to finalize operational sync.",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] overflow-y-auto border-none shadow-2xl p-0 transition-none bg-white scrollbar-hide">
        <div className="sticky top-0 z-30 bg-white/95 border-b border-slate-50 p-16 backdrop-blur-3xl">
          <SheetHeader className="space-y-10">
            <div className="h-24 w-24 rounded-[40px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/40">
                <Network className="h-12 w-12 text-brand-teal" />
            </div>
            <div className="space-y-4">
              <SheetTitle className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {partner ? "CONFIGURE_NODE" : "PROVISION_NODE"}
              </SheetTitle>
              <div className="flex items-center gap-6">
                  <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)]" />
                  <SheetDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
                    Operational identity, fiscal settlement & terminal access protocol matrix
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
            {/* Core Identity */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                  <div className="h-3 w-3 rounded-full bg-slate-900" />
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.3em]">CORE_IDENTITY_PROTOCOL</h4>
              </div>
              
              <div className="space-y-10 pl-8 border-l-4 border-slate-50">
                <div className="grid gap-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                    <Terminal className="h-5 w-5 text-slate-200" /> Registry Designation Identity
                  </Label>
                  <Input {...form.register("name")} placeholder="ENTER TERMINAL IDENTITY DESIGNATION..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                </div>

                <div className="grid gap-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                    <MapPin className="h-5 w-5 text-slate-200" /> Logistics Grid Sector Coords
                  </Label>
                  <Input {...form.register("location")} placeholder="ENTER OPERATIONAL VECTOR COORDS..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="grid gap-6">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                      <User className="h-5 w-5 text-slate-200" /> Operational Lead
                    </Label>
                    <Input {...form.register("contact_person")} placeholder="LEAD IDENTITY..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                  </div>
                  <div className="grid gap-6">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                      <Smartphone className="h-5 w-5 text-slate-200" /> Secure Comms Signal
                    </Label>
                    <Input {...form.register("phone_number")} placeholder="COMMS_ID_SYNC..." className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none tabular-nums" />
                  </div>
                </div>

                <div className="grid gap-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                    <CreditCard className="h-5 w-5 text-slate-200" /> Node Yield Coefficient Mapping (%)
                  </Label>
                  <div className="relative group">
                      <Input type="number" {...form.register("trade_discount_percentage")} className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none pr-20" />
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-lg font-black text-slate-200 group-focus-within:text-brand-teal transition-none">%</div>
                  </div>
                  <div className="flex items-center gap-4 pl-6">
                      <Info className="h-4 w-4 text-brand-teal" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol standard 20% | Automatic global settlement margin calculation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fiscal Settlement */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                  <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.3em]">FISCAL_SETTLEMENT_MATRIX</h4>
              </div>

              <div className="space-y-10 pl-8 border-l-4 border-slate-50">
                <div className="bg-slate-50/30 p-12 rounded-[40px] border border-slate-50 space-y-12 transition-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 hover:bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-[20px] bg-slate-900 flex items-center justify-center shadow-2xl">
                        <Landmark className="h-7 w-7 text-brand-teal" />
                      </div>
                      <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Banking Terminal Hub</span>
                    </div>
                    <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Bank Entity Name</Label>
                      <Input {...form.register("bank_details.bank_name")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none" />
                    </div>
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Registry ID Number</Label>
                      <Input {...form.register("bank_details.account_number")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none tabular-nums" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Legal Identity Owner</Label>
                      <Input {...form.register("bank_details.account_name")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none" />
                    </div>
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Branch Code ID</Label>
                      <Input {...form.register("bank_details.branch")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/30 p-12 rounded-[40px] border border-slate-50 space-y-12 transition-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 hover:bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-[20px] bg-slate-900 flex items-center justify-center shadow-2xl">
                        <Smartphone className="h-7 w-7 text-brand-teal" />
                      </div>
                      <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Mobile Liquidity Node</span>
                    </div>
                    <div className="h-3.5 w-3.5 rounded-full bg-brand-teal shadow-[0_0_15px_rgba(20,184,166,0.7)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Network Provider</Label>
                      <Input {...form.register("momo_details.network")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none" />
                    </div>
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Signal ID</Label>
                      <Input {...form.register("momo_details.number")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none tabular-nums" />
                    </div>
                    <div className="grid gap-6">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-6">Owner Identity</Label>
                      <Input {...form.register("momo_details.account_name")} className="h-16 rounded-2xl border-none bg-slate-50 font-black text-[12px] uppercase tracking-[0.2em] px-8 focus-visible:ring-0 focus-visible:bg-white shadow-sm transition-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Credentials */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.3em]">ACCESS_AUTHENTICATION_PROTOCOL</h4>
              </div>

              <div className="pl-8 border-l-4 border-slate-50">
                {partner?.user ? (
                  <div className="bg-emerald-500/5 p-12 rounded-[40px] border border-emerald-500/10 flex items-center justify-between shadow-2xl shadow-emerald-500/10 group">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                          <ShieldCheck className="h-5 w-5 text-emerald-500" />
                          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em]">Node Authentication Verified</p>
                      </div>
                      <p className="text-xl font-black text-slate-900 uppercase tracking-tight pl-9">{partner.user.email}</p>
                    </div>
                    <div className="h-20 w-20 rounded-[32px] bg-white border border-emerald-100 flex items-center justify-center shadow-2xl shadow-emerald-500/5 group-hover:scale-105 transition-transform duration-500">
                      <ShieldCheck className="h-10 w-10 text-emerald-500" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {!showUserFields ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-20 rounded-full border-none bg-slate-50 text-[12px] font-black uppercase tracking-[0.25em] text-slate-400 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
                        onClick={() => setShowUserFields(true)}
                      >
                        PROVISION_MASTER_AUTHENTICATION_STATION
                      </Button>
                    ) : (
                      <div className="p-12 bg-slate-900 rounded-[48px] border border-slate-800 space-y-12 shadow-2xl transition-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Key className="h-32 w-32 text-white" />
                        </div>
                        <div className="flex items-center gap-6 relative">
                            <Key className="h-7 w-7 text-brand-teal" />
                            <span className="text-[13px] font-black text-white uppercase tracking-[0.4em]">NEW_AUTHENTICATION_STREAM_SYNC</span>
                        </div>
                        <div className="space-y-10 relative">
                            <div className="grid gap-6">
                              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 pl-8">Admin Authorization Email</Label>
                              <Input type="email" {...form.register("user_email")} className="h-20 rounded-[32px] border-none bg-white/5 font-black text-sm uppercase tracking-[0.2em] px-10 transition-none text-white focus:bg-white/10" />
                            </div>
                            <div className="grid gap-6">
                              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 pl-8">Operational Master Key ID</Label>
                              <Input type="password" {...form.register("user_password")} className="h-20 rounded-[32px] border-none bg-white/5 font-black text-sm uppercase tracking-[0.2em] px-10 transition-none text-white focus:bg-white/10" />
                            </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 h-16 rounded-full hover:bg-rose-500/10 transition-none w-full border-none relative"
                          onClick={() => {
                            setShowUserFields(false);
                            form.setValue("user_email", "");
                            form.setValue("user_password", "");
                          }}
                        >
                          ABORT_PROVISIONING_SEQUENCE_SIGNAL
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
                  : partner ? "UPDATE_OPERATIONAL_NODE_SIGNAL" : "CONFIRM_NODE_PROVISIONING_EXECUTE"}
                {!form.formState.isSubmitting && !isPending && <ArrowRight className="h-8 w-8 text-brand-teal" />}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
