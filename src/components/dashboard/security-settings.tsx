"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { updatePharmacyPassword } from "@/lib/pharmacy-actions";

export function SecuritySettings() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please ensure both password fields match exactly.",
                variant: "destructive"
            });
            return;
        }

        if (passwords.newPassword.length < 6) {
             toast({
                title: "Password too short",
                description: "Your new password must be at least 6 characters long.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await updatePharmacyPassword(passwords.newPassword);
            
            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Success",
                    description: "Password updated successfully. Please use your new password next time you log in."
                });
                setPasswords({ newPassword: "", confirmPassword: "" });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Icon name="verified_user" className="text-emerald-500" opticalSize={24} />
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Security & Credentials</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Update your password to keep your account secure.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                         <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                              <Icon name="key" className="text-emerald-600" opticalSize={24} />
                         </div>
                         <div>
                             <h3 className="font-black text-slate-900 tracking-tight">Change Password</h3>
                             <p className="text-xs font-medium text-slate-500 mt-0.5">Account access security update</p>
                         </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                                id="newPassword" 
                                name="newPassword" 
                                type="password"
                                value={passwords.newPassword} 
                                onChange={handleChange} 
                                placeholder="Enter new password"
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                type="password"
                                value={passwords.confirmPassword} 
                                onChange={handleChange} 
                                placeholder="Confirm new password"
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-12 font-bold tracking-tight shadow-lg shadow-emerald-200">
                            {isLoading ? (
                                <Icon name="progress_activity" className="animate-spin" opticalSize={18} />
                            ) : (
                                <Icon name="save" fill opticalSize={18} />
                            )}
                            Update Password
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
