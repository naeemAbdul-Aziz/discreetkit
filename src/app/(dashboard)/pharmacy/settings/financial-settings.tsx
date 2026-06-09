"use client";

import { useActionState } from "react";
import { updatePharmacyFinancials } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";

interface FinancialSettingsProps {
    initialBankDetails: any;
    initialMomoDetails: any;
}

export default function FinancialSettings({ initialBankDetails, initialMomoDetails }: FinancialSettingsProps) {
    const [state, action, isPending] = useActionState(updatePharmacyFinancials, null);

    useEffect(() => {
        if (state?.success) {
            toast({
                title: "Financials Updated",
                description: "Your payout details have been synchronized successfully.",
            });
        } else if (state?.message) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: state.message,
            });
        }
    }, [state]);

    return (
        <form action={action} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bank Account Details */}
                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/50 backdrop-blur-sm overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-teal opacity-20 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-brand-teal/10 rounded-lg">
                                <Icon name="account_balance" className="text-brand-teal" opticalSize={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Bank Account</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tight">Direct Bank Transfer (EFT)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bank_name" className="text-xs font-black uppercase tracking-widest text-slate-500">Bank Name</Label>
                                <Input 
                                    id="bank_name" 
                                    name="bank_name" 
                                    defaultValue={initialBankDetails?.bank_name}
                                    placeholder="e.g. Standard Chartered, Ecobank"
                                    className="h-11 rounded-xl border-slate-200 focus:border-brand-teal focus:ring-brand-teal bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number" className="text-xs font-black uppercase tracking-widest text-slate-500">Account Number</Label>
                                <Input 
                                    id="account_number" 
                                    name="account_number" 
                                    defaultValue={initialBankDetails?.account_number}
                                    placeholder="Enter your 10-13 digit account number"
                                    className="h-11 rounded-xl border-slate-200 focus:border-brand-teal focus:ring-brand-teal bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank_account_name" className="text-xs font-black uppercase tracking-widest text-slate-500">Account Holder Name</Label>
                                <Input 
                                    id="bank_account_name" 
                                    name="bank_account_name" 
                                    defaultValue={initialBankDetails?.account_name}
                                    placeholder="Exactly as it appears on your statement"
                                    className="h-11 rounded-xl border-slate-200 focus:border-brand-teal focus:ring-brand-teal bg-white font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch" className="text-xs font-black uppercase tracking-widest text-slate-500">Branch Location</Label>
                                <Input 
                                    id="branch" 
                                    name="branch" 
                                    defaultValue={initialBankDetails?.branch}
                                    placeholder="The branch where you opened the account"
                                    className="h-11 rounded-xl border-slate-200 focus:border-brand-teal focus:ring-brand-teal bg-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile Money Details */}
                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/50 backdrop-blur-sm overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Icon name="smartphone" className="text-amber-500" opticalSize={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Mobile Money</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tight">Express MOMO Settlements</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Network Provider</Label>
                                <Select name="momo_network" defaultValue={initialMomoDetails?.network || "MTN"}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white">
                                        <SelectValue placeholder="Select Network" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                                        <SelectItem value="Telecel">Telecel Cash</SelectItem>
                                        <SelectItem value="AT">AT Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="momo_number" className="text-xs font-black uppercase tracking-widest text-slate-500">MOMO Number</Label>
                                <Input 
                                    id="momo_number" 
                                    name="momo_number" 
                                    defaultValue={initialMomoDetails?.number}
                                    placeholder="024XXXXXXX"
                                    className="h-11 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="momo_account_name" className="text-xs font-black uppercase tracking-widest text-slate-500">Registered Name</Label>
                                <Input 
                                    id="momo_account_name" 
                                    name="momo_account_name" 
                                    defaultValue={initialMomoDetails?.account_name}
                                    placeholder="Name registered on the MOMO SIM"
                                    className="h-11 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white"
                                />
                            </div>

                            <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Icon name="info" className="text-slate-500" opticalSize={16} fill />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Payout Note</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                    MOMO settlements are typically processed faster than bank transfers. Ensure the registered name matches your pharmacy license for compliance.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky bottom-8 z-20">
                <Button 
                    type="submit" 
                    disabled={isPending}
                    className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-slate-200/50 transition-all active:scale-95"
                >
                    {isPending ? (
                        <>
                            <Icon name="progress_activity" className="animate-spin" opticalSize={16} />
                            Synchronizing...
                        </>
                    ) : (
                        <>
                            <Icon name="save" opticalSize={16} />
                            Update Financial Profile
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
