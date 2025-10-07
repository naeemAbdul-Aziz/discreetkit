/**
 * @file inline-edit-field.tsx
 * @description A reusable component for editing a single product field (like price or stock) in a popover.
 */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProductField } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps {
  productId: number;
  fieldName: 'price_ghs' | 'stock_level';
  value: number | string;
  onUpdate: () => void;
}

const formSchema = z.object({
  value: z.coerce.number().min(0, 'Value cannot be negative.'),
});

type FormValues = z.infer<typeof formSchema>;

export function InlineEditField({ productId, fieldName, value, onUpdate }: InlineEditFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: Number(value) || 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await updateProductField({
        id: productId,
        field: fieldName,
        value: data.value,
      });

      if (result.success) {
        toast({
          title: 'Update Successful',
          description: `Product ${fieldName.replace('_', ' ')} has been updated.`,
        });
        onUpdate();
        setIsOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.message,
        });
      }
    });
  };

  // Reset form value when popover opens with a new value
  React.useEffect(() => {
    if (isOpen) {
      form.reset({ value: Number(value) });
    }
  }, [isOpen, value, form]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-foreground hover:bg-muted"
        >
          {fieldName === 'price_ghs' ? `GHS ${Number(value).toFixed(2)}` : value}
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`inline-edit-${fieldName}`} className="capitalize">
              Update {fieldName.replace('_', ' ')}
            </Label>
            <Input
              id={`inline-edit-${fieldName}`}
              type="number"
              step={fieldName === 'price_ghs' ? '0.01' : '1'}
              {...form.register('value')}
              className={cn(form.formState.errors.value && 'border-destructive')}
            />
            {form.formState.errors.value && (
              <p className="text-xs text-destructive">{form.formState.errors.value.message}</p>
            )}
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
