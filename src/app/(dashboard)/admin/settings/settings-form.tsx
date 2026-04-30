"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, Store, Zap, ShieldCheck, Activity, Terminal, ArrowRight, Loader2, Phone, Mail, Globe, Shield, User, Trash2, Key } from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { useToast } from "@/hooks/use-toast"
import { getStoreSettings, updateStoreSettings, type SettingsFormValues } from "@/lib/admin-actions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function SettingsForm() {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<SettingsFormValues>({
        store_name: "",
        support_email: "",
        support_phone: "",
        notifications_new_orders: true,
        notifications_low_stock: true,
        notifications_partner_signup: false,
    })

    useEffect(() => {
        async function loadSettings() {
            const data = await getStoreSettings()
            if (data) {
                setFormData({
                    store_name: data.store_name,
                    support_email: data.support_email,
                    support_phone: data.support_phone,
                    notifications_new_orders: data.notifications_new_orders,
                    notifications_low_stock: data.notifications_low_stock,
                    notifications_partner_signup: data.notifications_partner_signup,
                })
            }
        }
        loadSettings()
    }, [])

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const result = await updateStoreSettings(formData)
            if (result.success) {
                toast({
                    title: "PROTOCOL_SYNCHRONIZED",
                    description: "Global system parameters successfully updated in master matrix.",
                })
            } else {
                toast({
                    title: "REGISTRY_ERROR",
                    description: "Failed to finalize configuration sync.",
                    variant: "destructive",
                })
            }
        } catch (error) {
             toast({
                title: "TERMINAL_CRITICAL",
                description: "An unexpected error occurred during protocol execution.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <Tabs defaultValue="general" className="space-y-16">
      <div className="flex items-center justify-center lg:justify-start px-4">
        <TabsList className="bg-slate-50 p-3 rounded-full h-24 border border-slate-100 gap-4 shadow-sm">
            <TabsTrigger 
                value="general" 
                className="rounded-full px-16 h-18 font-black text-[13px] uppercase tracking-[0.3em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none gap-6"
            >
                <Store className="h-6 w-6" />
                GENERAL_NODES
            </TabsTrigger>
            <TabsTrigger 
                value="notifications" 
                className="rounded-full px-16 h-18 font-black text-[13px] uppercase tracking-[0.3em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none gap-6"
            >
                <Bell className="h-6 w-6" />
                LOGISTICS_ALERTS
            </TabsTrigger>
            <TabsTrigger 
                value="security" 
                className="rounded-full px-16 h-18 font-black text-[13px] uppercase tracking-[0.3em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none gap-6"
            >
                <ShieldCheck className="h-6 w-6" />
                SECURITY_PROTOCOL
            </TabsTrigger>
        </TabsList>
      </div>
      
      {/* General Settings */}
      <TabsContent value="general" className="outline-none space-y-12">
        <div className="space-y-12 max-w-4xl px-4">
            <div className="space-y-12 pl-12 border-l-4 border-slate-50">
                <div className="grid gap-8">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                        <Terminal className="h-5 w-5 text-slate-200" /> Store Identity Protocol
                    </Label>
                    <Input 
                        value={formData.store_name} 
                        onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                        className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
                    />
                </div>

                <div className="grid gap-8">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                        <Mail className="h-5 w-5 text-slate-200" /> Support Endpoint Email
                    </Label>
                    <Input 
                        value={formData.support_email} 
                        onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                        className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="grid gap-8">
                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                            <Phone className="h-5 w-5 text-slate-200" /> Support Phone Matrix
                        </Label>
                        <Input 
                            value={formData.support_phone} 
                            onChange={(e) => setFormData({...formData, support_phone: e.target.value})}
                            className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
                        />
                    </div>
                    <div className="grid gap-8">
                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                            <Globe className="h-5 w-5 text-slate-200" /> Operational Liquidity
                        </Label>
                        <div className="relative group">
                            <Input defaultValue="GHS (Ghanaian Cedi)" disabled className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 opacity-50 cursor-not-allowed" />
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-sm font-black text-slate-200">₵</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-slate-50">
                <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="h-20 px-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 transition-none border-none gap-8 group"
                >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-brand-teal" /> : <ShieldCheck className="h-6 w-6 text-brand-teal group-hover:scale-110 transition-transform duration-300" />}
                    UPDATE_STORE_PARAMETERS
                    {!isLoading && <ArrowRight className="h-6 w-6 text-brand-teal group-hover:translate-x-2 transition-transform duration-300" />}
                </Button>
            </div>
        </div>
      </TabsContent>

      {/* Notification Settings */}
      <TabsContent value="notifications" className="outline-none space-y-12">
        <div className="space-y-12 max-w-4xl px-4">
            <div className="pl-12 border-l-4 border-slate-50 space-y-12">
                <div className="bg-slate-50/30 p-12 rounded-[40px] border border-slate-50 space-y-12 transition-none shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 hover:bg-white">
                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                             <Zap className="h-8 w-8 text-brand-teal" />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 block">Fulfillment Pulse Alerts</Label>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Real-time terminal signal for new order placement.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={formData.notifications_new_orders}
                         onCheckedChange={(checked) => setFormData({...formData, notifications_new_orders: checked})}
                         className="h-10 w-20 data-[state=checked]:bg-slate-900 border-none transition-none shadow-sm"
                       />
                    </div>

                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                             <Activity className="h-8 w-8 text-rose-500" />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 block">Inventory Criticality Sync</Label>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Automated escalation when SKU levels fall below 10 units.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={formData.notifications_low_stock}
                         onCheckedChange={(checked) => setFormData({...formData, notifications_low_stock: checked})}
                         className="h-10 w-20 data-[state=checked]:bg-rose-500 border-none transition-none shadow-sm"
                       />
                    </div>

                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                             <User className="h-8 w-8 text-sky-500" />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 block">Node Provisioning Stream</Label>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Alert signal when a new partner station initiates registration.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={formData.notifications_partner_signup}
                         onCheckedChange={(checked) => setFormData({...formData, notifications_partner_signup: checked})}
                         className="h-10 w-20 data-[state=checked]:bg-sky-500 border-none transition-none shadow-sm"
                       />
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-slate-50">
                <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="h-20 px-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 transition-none border-none gap-8 group"
                >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-brand-teal" /> : <Bell className="h-6 w-6 text-brand-teal group-hover:scale-110 transition-transform duration-300" />}
                    UPDATE_NOTIFICATION_MATRIX
                    {!isLoading && <ArrowRight className="h-6 w-6 text-brand-teal group-hover:translate-x-2 transition-transform duration-300" />}
                </Button>
            </div>
        </div>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="outline-none space-y-16">
        <div className="space-y-16 max-w-4xl px-4">
            <div className="pl-12 border-l-4 border-slate-50 space-y-12">
                <div className="grid gap-8">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                        <Lock className="h-5 w-5 text-slate-200" /> Current Access Key
                    </Label>
                    <Input type="password" placeholder="••••••••••••••••" className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="grid gap-8">
                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                            <Key className="h-5 w-5 text-slate-200" /> New Access Key
                        </Label>
                        <Input type="password" placeholder="••••••••••••••••" className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                    </div>
                    <div className="grid gap-8">
                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4 pl-6">
                            <ShieldCheck className="h-5 w-5 text-slate-200" /> Confirm Protocol Key
                        </Label>
                        <Input type="password" placeholder="••••••••••••••••" className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none" />
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-50">
                    <Button 
                        className="h-20 px-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 transition-none border-none gap-8 group"
                    >
                        <Shield className="h-6 w-6 text-brand-teal group-hover:scale-110 transition-transform duration-300" />
                        ROTATE_SECURITY_KEYS
                        <ArrowRight className="h-6 w-6 text-brand-teal group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                </div>
            </div>

            <div className="space-y-12">
                <div className="flex items-center gap-6">
                    <div className="h-3 w-3 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(15,23,42,0.6)]" />
                    <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.3em]">ADMIN_NODE_AUTHORIZATION</h4>
                </div>

                <div className="pl-12 border-l-4 border-slate-50 space-y-10">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5 space-y-10">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    <span className="text-2xl font-black text-brand-teal">NA</span>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-base font-black text-slate-900 uppercase tracking-tight">Naeem Aziz (You)</p>
                                    <div className="flex items-center gap-4">
                                        <div className="h-1.5 w-6 bg-brand-teal rounded-full" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">SUPER_ADMIN_NODE</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="h-14 px-10 rounded-full font-black text-[11px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 cursor-not-allowed transition-none">MASTER_LOCK</Button>
                        </div>

                        <Separator className="bg-slate-50" />

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-8">
                                <div className="h-20 w-20 rounded-[32px] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors duration-500">
                                    <span className="text-2xl font-black text-slate-200 group-hover:text-brand-teal transition-colors">DK</span>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-teal transition-colors">Support Team Node</p>
                                    <div className="flex items-center gap-4">
                                        <div className="h-1.5 w-6 bg-slate-200 rounded-full" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">OPERATIONAL_EDITOR</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="h-14 w-14 rounded-full text-slate-200 hover:text-rose-600 hover:bg-rose-50 transition-none border-none shadow-sm">
                                <Trash2 className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    <Button variant="outline" className="h-20 w-full rounded-full font-black text-[12px] uppercase tracking-[0.3em] border-none bg-slate-50/50 text-slate-400 hover:bg-slate-900 hover:text-white transition-none shadow-sm gap-8 group">
                        <Plus className="h-6 w-6 text-brand-teal group-hover:rotate-90 transition-transform duration-300" />
                        PROVISION_NEW_ADMIN_NODE
                    </Button>
                </div>
            </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
