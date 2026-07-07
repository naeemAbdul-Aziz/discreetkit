"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { updatePharmacyProfile } from "@/lib/pharmacy-actions";

interface StoreProfileSettingsProps {
    initialProfile: any;
    onUpdate?: () => void;
}

export function StoreProfileSettings({ initialProfile, onUpdate }: StoreProfileSettingsProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialProfile?.name || "",
        location: initialProfile?.location || "",
        contact_person: initialProfile?.contact_person || "",
        phone_number: initialProfile?.phone_number || "",
        email: initialProfile?.email || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const result = await updatePharmacyProfile(formData);
            
            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Success",
                    description: "Store profile updated successfully."
                });
                onUpdate?.();
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
                    <Icon name="storefront" className="text-brand-teal" opticalSize={24} />
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Store Profile</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Manage your pharmacy's public information.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Pharmacy Name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="e.g. LifeCare Pharmacy"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="location">Physical Location</Label>
                        <Input 
                            id="location" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange} 
                            placeholder="e.g. East Legon, Accra"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input 
                            id="contact_person" 
                            name="contact_person" 
                            value={formData.contact_person} 
                            onChange={handleChange} 
                            placeholder="e.g. Dr. Kwame Mensah"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input 
                            id="phone_number" 
                            name="phone_number" 
                            value={formData.phone_number} 
                            onChange={handleChange} 
                            placeholder="e.g. 0241234567"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Support Email</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="e.g. support@lifecare.com"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isLoading} className="gap-2 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full px-8 h-12 font-bold tracking-tight shadow-lg shadow-brand-teal/20">
                        {isLoading ? (
                            <Icon name="progress_activity" className="animate-spin" opticalSize={18} />
                        ) : (
                            <Icon name="save" fill opticalSize={18} />
                        )}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
