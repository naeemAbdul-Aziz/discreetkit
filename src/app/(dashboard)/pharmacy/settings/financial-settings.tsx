"use client";

import { useState, useEffect } from "react";
import { updatePharmacyFinancials } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icon";

interface FinancialSettingsProps {
    initialBankDetails: any;
    initialMomoDetails: any;
    onUpdate?: () => void;
}

export default function FinancialSettings({ 
    initialBankDetails, 
    initialMomoDetails,
    onUpdate 
}: FinancialSettingsProps) {
    const { toast } = useToast();
    const [isPending, setIsPending] = useState(false);
    
    // Tab selector for editing: bank or momo
    const [payoutMethod, setPayoutMethod] = useState<"bank" | "momo">("bank");

    // Controlled inputs for Bank
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [branch, setBranch] = useState("");

    // Controlled inputs for MOMO
    const [momoNetwork, setMomoNetwork] = useState("MTN");
    const [momoNumber, setMomoNumber] = useState("");
    const [momoAccountName, setMomoAccountName] = useState("");

    // Initialize & Sync from props
    useEffect(() => {
        setBankName(initialBankDetails?.bank_name || "");
        setAccountNumber(initialBankDetails?.account_number || "");
        setBankAccountName(initialBankDetails?.account_name || "");
        setBranch(initialBankDetails?.branch || "");

        setMomoNetwork(initialMomoDetails?.network || "MTN");
        setMomoNumber(initialMomoDetails?.number || "");
        setMomoAccountName(initialMomoDetails?.account_name || "");

        // Set default tab based on populated values
        if (initialMomoDetails?.number && !initialBankDetails?.account_number) {
            setPayoutMethod("momo");
        } else {
            setPayoutMethod("bank");
        }
    }, [initialBankDetails, initialMomoDetails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData();
        formData.append("bank_name", bankName);
        formData.append("account_number", accountNumber);
        formData.append("bank_account_name", bankAccountName);
        formData.append("branch", branch);
        formData.append("momo_network", momoNetwork);
        formData.append("momo_number", momoNumber);
        formData.append("momo_account_name", momoAccountName);

        try {
            const result = await updatePharmacyFinancials(null, formData);
            if (result?.success) {
                toast({
                    title: "Financials Updated",
                    description: "Your payout details have been synchronized successfully.",
                });
                onUpdate?.(); // Trigger parent refetch to propagate updates
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: result?.message || "Failed to update financial profile.",
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "An unexpected error occurred",
            });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl animate-in fade-in duration-500">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Icon name="payments" className="text-brand-teal" opticalSize={24} />
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Payout & Financials</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Configure your destination for order payouts and settlements.</p>
                    </div>
                </div>
            </div>

            {/* Payout Selection Segment Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl max-w-md border border-slate-200/50">
                <button
                    type="button"
                    onClick={() => setPayoutMethod("bank")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200",
                        payoutMethod === "bank"
                            ? "bg-white text-brand-teal shadow-sm border border-slate-200/40"
                            : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <Icon name="account_balance" className="h-4 w-4" />
                    Bank Account
                </button>
                <button
                    type="button"
                    onClick={() => setPayoutMethod("momo")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200",
                        payoutMethod === "momo"
                            ? "bg-white text-brand-teal shadow-sm border border-slate-200/40"
                            : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <Icon name="smartphone" className="h-4 w-4" />
                    Mobile Money
                </button>
            </div>

            {/* Config Card */}
            <Card className="border border-slate-100 shadow-xl shadow-slate-100/40 bg-white rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-teal" />
                <CardHeader className="pb-6 pt-8">
                    <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                        {payoutMethod === "bank" ? "Bank Settlement details" : "Mobile Money Settlement Details"}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500">
                        {payoutMethod === "bank" 
                            ? "Configure your direct bank transfer details (Electronic Funds Transfer)." 
                            : "Configure your express mobile wallet for instant payments."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    {payoutMethod === "bank" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bank_name" className="text-xs font-bold text-slate-700">Bank Name</Label>
                                <Input 
                                    id="bank_name" 
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="e.g. Standard Chartered, Ecobank"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-brand-teal focus-visible:border-brand-teal bg-white font-medium text-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number" className="text-xs font-bold text-slate-700">Account Number</Label>
                                <Input 
                                    id="account_number" 
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Enter your 10-13 digit account number"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-brand-teal focus-visible:border-brand-teal bg-white font-medium text-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank_account_name" className="text-xs font-bold text-slate-700">Account Holder Name</Label>
                                <Input 
                                    id="bank_account_name" 
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    placeholder="Exactly as it appears on your statement"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-brand-teal focus-visible:border-brand-teal bg-white font-medium text-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch" className="text-xs font-bold text-slate-700">Branch Location</Label>
                                <Input 
                                    id="branch" 
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    placeholder="The branch where you opened the account"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-brand-teal focus-visible:border-brand-teal bg-white font-medium text-slate-800"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Network Provider</Label>
                                <Select value={momoNetwork} onValueChange={setMomoNetwork}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-brand-teal focus:border-brand-teal bg-white font-medium text-slate-800">
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
                                <Label htmlFor="momo_number" className="text-xs font-bold text-slate-700">MOMO Number</Label>
                                <Input 
                                    id="momo_number" 
                                    value={momoNumber}
                                    onChange={(e) => setMomoNumber(e.target.value)}
                                    placeholder="024XXXXXXX"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-brand-teal focus-visible:border-brand-teal bg-white font-medium text-slate-800"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="momo_account_name" className="text-xs font-bold text-slate-700">Registered Name</Label>
                                <Input 
                                    id="momo_account_name" 
                                    value={momoAccountName}
                                    onChange={(e) => setMomoAccountName(e.target.value)}
                                    placeholder="Name registered on the MOMO SIM"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-brand-teal focus-visible:border-brand-teal bg-white font-medium text-slate-800"
                                />
                            </div>

                            <div className="md:col-span-2 mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                                <div className="p-1 bg-brand-teal/10 rounded-lg text-brand-teal mt-0.5">
                                    <Icon name="info" className="h-4 w-4" fill />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Payout Note</span>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Mobile Money settlements are processed automatically. Ensure the registered wallet name matches your business license for swift compliance approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="pt-4 flex justify-end">
                <Button 
                    type="submit" 
                    disabled={isPending}
                    className="gap-2 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full px-8 h-12 font-bold tracking-tight shadow-lg shadow-brand-teal/20"
                >
                    {isPending ? (
                        <>
                            <Icon name="progress_activity" className="animate-spin" opticalSize={18} />
                            Saving Financials...
                        </>
                    ) : (
                        <>
                            <Icon name="save" fill opticalSize={18} />
                            Save Payout Settings
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
