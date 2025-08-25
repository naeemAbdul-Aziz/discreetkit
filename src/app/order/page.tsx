
'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createOrderAction } from '@/lib/actions';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RecentOrders } from '../(components)/recent-orders';
import { ChatTrigger } from '@/components/chat-trigger';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Processing...' : 'Proceed to Payment'}
    </Button>
  );
}

export default function OrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState = { message: null, errors: {}, success: false, code: null };
  const [state, dispatch] = useActionState(createOrderAction, initialState);

  useEffect(() => {
    if (state.success && state.code) {
      toast({
        title: 'Order Received!',
        description: 'Redirecting to confirmation...',
        variant: 'default',
      });
      router.push(`/order/success?code=${state.code}`);
    } else if (state.message && !state.success) {
      toast({
        title: 'An error occurred',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast]);

  return (
    <>
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">Order Your Test Kit</h1>
        <p className="mt-2 text-lg text-muted-foreground">A simple, private, and secure process.</p>
      </div>

       <div className="mt-8">
          <ChatTrigger />
      </div>

      <form ref={formRef} action={dispatch} className="mt-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Your Product</CardTitle>
            <CardDescription>Choose the self-test kit you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup name="productId" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {products.map((product) => (
                <Label
                  key={product.id}
                  htmlFor={`product-${product.id}`}
                  className="flex flex-col items-start space-y-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-ring"
                >
                  <div className="flex w-full justify-between">
                    <span className="font-bold">{product.name}</span>
                    <RadioGroupItem value={String(product.id)} id={`product-${product.id}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{product.description}</span>
                  <span className="font-semibold">GHS {product.priceGHS.toFixed(2)}</span>
                </Label>
              ))}
            </RadioGroup>
             {state.errors?.productId && <p className="text-sm font-medium text-destructive mt-2">{state.errors.productId[0]}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Delivery Information</CardTitle>
            <CardDescription>
              We only need a location and contact for the delivery rider. Your details are deleted after delivery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryArea">Delivery Area / Campus</Label>
              <Input id="deliveryArea" name="deliveryArea" placeholder="e.g., UPSA Campus, East Legon" required />
               <p className="text-[0.8rem] text-muted-foreground">
                Please be as specific as possible.
               </p>
              {state.errors?.deliveryArea && <p className="text-sm font-medium text-destructive">{state.errors.deliveryArea[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddressNote">Additional Notes for Delivery Agent</Label>
              <Textarea id="deliveryAddressNote" name="deliveryAddressNote" placeholder="e.g., 'Call upon arrival at the main gate', 'Leave with the security.'" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone_masked">Contact Number (for delivery rider only)</Label>
              <Input id="phone_masked" name="phone_masked" type="tel" placeholder="e.g., 024xxxxxxx" required />
               <p className="text-[0.8rem] text-muted-foreground">
                This will be masked and is only for the rider to contact you.
               </p>
              {state.errors?.phone_masked && <p className="text-sm font-medium text-destructive">{state.errors.phone_masked[0]}</p>}
            </div>
          </CardContent>
        </Card>
        
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Your Privacy is Guaranteed</AlertTitle>
          <AlertDescription>
            Your payment will be processed securely by Paystack. We do not see or store your payment information. The next screen will redirect you to their payment page.
          </AlertDescription>
        </Alert>

        {state.message && !state.success && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <SubmitButton />
      </form>
    </div>
    <RecentOrders />
    </>
  );
}
