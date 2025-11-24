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
import { upsertPharmacy } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface PartnerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner?: any
}

export function PartnerSheet({ open, onOpenChange, partner }: PartnerSheetProps) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      contact_person: "",
      phone_number: "",
      email: "",
    },
  })

  useEffect(() => {
    if (partner) {
      form.reset({
        ...partner,
        contact_person: partner.contact_person || "",
        phone_number: partner.phone_number || "",
        email: partner.email || "",
      })
    } else {
      form.reset({
        name: "",
        location: "",
        contact_person: "",
        phone_number: "",
        email: "",
      })
    }
  }, [partner, form])

  async function onSubmit(data: FormValues) {
    try {
      const res = await upsertPharmacy(data)
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: res.error })
      } else {
        toast({ title: "Success", description: "Partner saved successfully." })
        onOpenChange(false)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px]">
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
