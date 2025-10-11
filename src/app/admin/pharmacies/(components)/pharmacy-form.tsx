/**
 * @file pharmacy-form.tsx
 * @description A reusable form component for creating and editing pharmacies.
 */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect } from 'react';
import { savePharmacy } from '@/lib/actions';
import { type Pharmacy } from '@/lib/data';
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const pharmacyFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  location: z.string().min(3, 'Location is required.'),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email('Must be a valid email.').optional().or(z.literal('')),
});

type PharmacyFormValues = z.infer<typeof pharmacyFormSchema>;

export function PharmacyForm({ pharmacy, onFormSubmit }: { pharmacy?: Pharmacy, onFormSubmit?: () => void }) {
  const { toast } = useToast();

  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacyFormSchema),
    defaultValues: pharmacy || {
      name: '',
      location: '',
      contact_person: '',
      phone_number: '',
      email: '',
    },
  });

  useEffect(() => {
    form.reset(pharmacy);
  }, [pharmacy, form.reset]);

  const [state, formAction, isPending] = useActionState(savePharmacy, null);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: pharmacy ? "Pharmacy Updated!" : "Pharmacy Added!",
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
  }, [state, toast, onFormSubmit, pharmacy, form]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="space-y-6"
      >
        {pharmacy && <input type="hidden" name="id" value={pharmacy.id} />}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pharmacy Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Top-Up Pharmacy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location / Branch</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Legon Campus" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., 024xxxxxxx" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., contact@pharmacy.com" {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormDescription>
                This email can be used for sending automated order notifications in the future.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pharmacy ? 'Save Changes' : 'Add Pharmacy'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
