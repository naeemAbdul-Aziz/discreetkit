
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createOrderAction } from '@/lib/actions';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChatTrigger } from '@/components/chat-trigger';
import { useCart } from '@/hooks/use-cart';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Processing...' : 'Proceed to Payment'}
    </Button>
  );
}

function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const { items, clearCart } = useCart();

  const initialState = { message: null, errors: {}, success: false, code: null };
  const [state, dispatch] = useActionState(createOrderAction, initialState);

  useEffect(() => {
    if (state.success && state.code) {
      toast({
        title: 'Order Received!',
        description: 'Redirecting to confirmation...',
        variant: 'default',
      });
      clearCart();
      router.push(`/order/success?code=${state.code}`);
    } else if (state.message && !state.success) {
      toast({
        title: 'An error occurred',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast, clearCart]);

  if (items.length === 0) {
    return (
        <div className="text-center space-y-4">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground/30" />
            <h1 className="font-headline text-3xl font-bold md:text-4xl">Your Cart is Empty</h1>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">Looks like you haven't added any products yet.</p>
            <Button asChild>
                <a href="/#products">Start Shopping</a>
            </Button>
        </div>
    )
  }

  return (
     <>
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">Complete Your Order</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">A simple, private, and secure process.</p>
      </div>

       <div className="mt-8">
          <ChatTrigger />
      </div>

      <form ref={formRef} action={dispatch} className="mt-8 space-y-8">
        <input type="hidden" name="cartItems" value={JSON.stringify(items)} />

        <Card>
            <CardHeader>
                <CardTitle>1. Review Your Order</CardTitle>
                <CardDescription>These are the items in your cart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">GHS {(item.priceGHS * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
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
                <div className="flex items-center gap-2">
                    <Label htmlFor="phone_masked">Contact Number (for delivery rider only)</Label>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </div>
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
    </>
  );
}

export default function OrderPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20 md:px-6">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderForm />
      </Suspense>
    </div>
  )
}
