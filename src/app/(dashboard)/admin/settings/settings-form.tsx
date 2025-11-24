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
import { Bell, Lock, Store } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getStoreSettings, updateStoreSettings, type SettingsFormValues } from "@/lib/admin-actions"

export function SettingsForm() {
    const { toast } = useToast()
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
                    title: "Settings saved",
                    description: "Your changes have been successfully updated.",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save settings.",
                    variant: "destructive",
                })
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" /> General
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Security
        </TabsTrigger>
      </TabsList>
      
      {/* General Settings */}
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              Manage your store details and public profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Store Name</Label>
              <Input 
                id="name" 
                value={formData.store_name} 
                onChange={(e) => setFormData({...formData, store_name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Support Email</Label>
              <Input 
                id="email" 
                value={formData.support_email} 
                onChange={(e) => setFormData({...formData, support_email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="phone">Support Phone</Label>
                    <Input 
                        id="phone" 
                        value={formData.support_phone} 
                        onChange={(e) => setFormData({...formData, support_phone: e.target.value})}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" defaultValue="GHS (Ghanaian Cedi)" disabled />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Notification Settings */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive alerts and updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
              <Label htmlFor="new-orders" className="flex flex-col space-y-1">
                <span>New Orders</span>
                <span className="font-normal text-muted-foreground">Receive an email when a new order is placed.</span>
              </Label>
              <Switch 
                id="new-orders" 
                checked={formData.notifications_new_orders}
                onCheckedChange={(checked) => setFormData({...formData, notifications_new_orders: checked})}
              />
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
              <Label htmlFor="low-stock" className="flex flex-col space-y-1">
                <span>Low Stock Alerts</span>
                <span className="font-normal text-muted-foreground">Get notified when products fall below 10 units.</span>
              </Label>
              <Switch 
                id="low-stock" 
                checked={formData.notifications_low_stock}
                onCheckedChange={(checked) => setFormData({...formData, notifications_low_stock: checked})}
              />
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
              <Label htmlFor="partner-signup" className="flex flex-col space-y-1">
                <span>New Partner Signups</span>
                <span className="font-normal text-muted-foreground">Receive an alert when a pharmacy registers.</span>
              </Label>
              <Switch 
                id="partner-signup" 
                checked={formData.notifications_partner_signup}
                onCheckedChange={(checked) => setFormData({...formData, notifications_partner_signup: checked})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and account access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>Update Password</Button>
          </CardFooter>
        </Card>
        
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Admin Accounts</CardTitle>
                <CardDescription>Manage who has access to this dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                NA
                            </div>
                            <div>
                                <p className="text-sm font-medium">Naeem Aziz (You)</p>
                                <p className="text-xs text-muted-foreground">Super Admin</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>Manage</Button>
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                                DK
                            </div>
                            <div>
                                <p className="text-sm font-medium">Support Team</p>
                                <p className="text-xs text-muted-foreground">Editor</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Remove</Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full mt-2 sm:mt-0">Invite New Admin</Button>
            </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
