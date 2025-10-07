/**
 * @file product-form.tsx
 * @description A reusable form component for creating and editing products.
 */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect } from 'react';
import { saveProduct } from '@/lib/actions';
import { type Product } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z.string().optional(),
  price_ghs: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string({ required_error: 'Category is required.' }),
  sub_category: z.string().optional(),
  brand: z.string().optional(),
  stock_level: z.coerce
    .number()
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.'),
  image_url: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  requires_prescription: z.boolean().default(false),
  is_student_product: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const productCategories = ['Test Kit', 'Wellness', 'Bundle', 'Medication'];
const wellnessSubCategories = ['Contraception', 'Condoms', 'Personal Care'];

export function ProductForm({ product, onFormSubmit }: { product?: Product, onFormSubmit?: () => void }) {
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price_ghs: 0,
      category: '',
      sub_category: '',
      brand: '',
      stock_level: 0,
      image_url: '',
      requires_prescription: false,
      is_student_product: false,
    },
  });

  // Effect to reset form when the product prop changes
   useEffect(() => {
    form.reset({
      name: product?.name ?? '',
      description: product?.description ?? '',
      price_ghs: product?.price_ghs ?? 0,
      category: product?.category ?? '',
      sub_category: product?.sub_category ?? '',
      brand: product?.brand ?? '',
      stock_level: product?.stock_level ?? 0,
      image_url: product?.image_url ?? '',
      requires_prescription: product?.requires_prescription ?? false,
      is_student_product: product?.is_student_product ?? false,
    });
  }, [product, form.reset]);


  const [state, formAction, isPending] = useActionState(saveProduct, null);

  useEffect(() => {
    if (state?.success) {
        toast({
            title: product ? "Product Updated!" : "Product Created!",
            description: `${form.getValues('name')} has been saved successfully.`,
        });
        if (onFormSubmit) {
          onFormSubmit();
        }
    } else if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  }, [state, toast, onFormSubmit, product, form]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {product && <input type="hidden" name="id" value={product.id} />}

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Standard HIV Kit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A short, clear description of the product."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price_ghs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (GHS)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Level</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('category') === 'Wellness' && (
            <FormField
              control={form.control}
              name="sub_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wellness Sub-Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wellnessSubCategories.map((subCat) => (
                        <SelectItem key={subCat} value={subCat}>
                          {subCat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Durex, Fiesta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="requires_prescription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Prescription</FormLabel>
                    <FormDescription>
                      Check this if the product is a medication that needs a
                      valid prescription for purchase.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="is_student_product"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Eligible for Student Discount</FormLabel>
                    <FormDescription>
                      Check this if the product is eligible for special student pricing or promotions.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
