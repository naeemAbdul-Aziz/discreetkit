"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { upsertPharmacy, createPharmacyWithUser } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  user_email: z.string().email().optional().or(z.literal("")),
  user_password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface PartnerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner?: any
}

export function PartnerSheet({ open, onOpenChange, partner }: PartnerSheetProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [showUserFields, setShowUserFields] = useState(false)
  
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
    },
  })

  useEffect(() => {
    if (partner) {
      form.reset({
        ...partner,
        contact_person: partner.contact_person || "",
        phone_number: partner.phone_number || "",
        email: partner.email || "",
        user_email: "",
        user_password: "",
      })
      setShowUserFields(false)
    } else {
      form.reset({
        name: "",
        location: "",
        contact_person: "",
        phone_number: "",
        email: "",
        user_email: "",
        user_password: "",
      })
      setShowUserFields(false)
    }
  }, [partner, form])

  async function onSubmit(data: FormValues) {
    try {
      let res
      
      // If creating new pharmacy with user credentials
      if (!data.id && data.user_email && data.user_password) {
        res = await createPharmacyWithUser(data)
      } else if (data.id && data.user_email && data.user_password) {
        // Update pharmacy details first
        await upsertPharmacy(data)
        // Then link user
        res = await import("@/lib/admin-actions").then(mod => mod.linkPharmacyUser(data.id!, data.user_email!, data.user_password!))
      } else {
        // Regular update or create without user
        res = await upsertPharmacy(data)
      }
      
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: res.error })
      } else {
        toast({ title: "Success", description: "Partner saved successfully." })
        router.refresh()
        onOpenChange(false)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{partner ? "Edit Partner" : "Add Partner"}</SheetTitle>
          <SheetDescription>
            Manage pharmacy details and contact info.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Pharmacy Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location / Address</Label>
            <Input id="location" {...form.register("location")} />
            {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input id="contact" {...form.register("contact_person")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone_number")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
          </div>

          <Separator className="my-2" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">User Account</Label>
            </div>
            
            {partner?.user ? (
              <div className="bg-muted/50 p-3 rounded-md border">
                <p className="text-sm font-medium">Linked Account</p>
                <p className="text-sm text-muted-foreground">{partner.user.email}</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {partner ? "This partner has no user account. Create one below." : "Create a login account for this pharmacy to access their portal."}
                </p>
                
                {!showUserFields ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowUserFields(true)}
                  >
                    Add User Account
                  </Button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="grid gap-2">
                      <Label htmlFor="user_email">User Email</Label>
                      <Input id="user_email" type="email" {...form.register("user_email")} placeholder="pharmacy@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="user_password">Password</Label>
                      <Input id="user_password" type="password" {...form.register("user_password")} placeholder="Min. 6 characters" />
                      {form.formState.errors.user_password && <p className="text-sm text-destructive">{form.formState.errors.user_password.message}</p>}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowUserFields(false)
                        form.setValue("user_email", "")
                        form.setValue("user_password", "")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
