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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { upsertProduct } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price_ghs: z.coerce.number().min(0, "Price must be positive"),
  stock_level: z.coerce.number().int().min(0, "Stock must be positive"),
  image_url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  featured: z.boolean().optional(),
  requires_prescription: z.boolean().optional(),
  is_student_product: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProductSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  categories?: any[]
}

export function ProductSheet({ open, onOpenChange, product, categories = [] }: ProductSheetProps) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price_ghs: 0,
      stock_level: 0,
      image_url: "",
      description: "",
    },
  })

  // Reset form when product changes (Edit mode vs Add mode)
  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        image_url: product.image_url || "",
        description: product.description || "",
      })
    } else {
      form.reset({
        name: "",
        category: "",
        price_ghs: 0,
        stock_level: 0,
        image_url: "",
        description: "",
      })
    }
  }, [product, form])

  async function onSubmit(data: FormValues) {
    try {
      const res = await upsertProduct(data)
      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error,
        })
      } else {
        toast({
          title: "Success",
          description: product ? "Product updated successfully." : "Product added successfully.",
        })
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? "Edit Product" : "Add Product"}</SheetTitle>
          <SheetDescription>
            {product ? "Make changes to your product here." : "Add a new product to your inventory."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <input type="hidden" {...form.register("id")} />
          
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                onValueChange={(val) => form.setValue("category", val)} 
                defaultValue={product?.category}
                value={form.watch("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  {categories.length === 0 && (
                     <SelectItem value="Uncategorized" disabled>No categories found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock Level</Label>
              <Input id="stock" type="number" {...form.register("stock_level")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price (GHS)</Label>
            <Input id="price" type="number" step="0.01" {...form.register("price_ghs")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" placeholder="https://..." {...form.register("image_url")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>

          <div className="flex items-center gap-4">
             {/* Add checkboxes for boolean flags if I update the schema later, for now just ensuring ID is there */}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="featured" 
                className="h-4 w-4 rounded border-gray-300"
                {...form.register("featured")} 
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="prescription" 
                className="h-4 w-4 rounded border-gray-300"
                {...form.register("requires_prescription")} 
              />
              <Label htmlFor="prescription">Requires Prescription</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="student" 
                className="h-4 w-4 rounded border-gray-300"
                {...form.register("is_student_product")} 
              />
              <Label htmlFor="student">Student Discount Eligible</Label>
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
