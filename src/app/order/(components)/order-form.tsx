
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrderAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, ArrowRight, GraduationCap, AlertTriangle, Lock, Mail } from 'lucide-react';
import { ChatTrigger } from '@/components/chat-trigger';
import { useCart } from '@/hooks/use-cart';
import { discounts } from '@/lib/data';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Proceed to Payment
          <ArrowRight />
        </>
      )}
    </Button>
  );
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { items, subtotal, studentDiscount, deliveryFee, totalPrice, clearCart, deliveryLocation, setDeliveryLocation, isStudent } = useCart(
    (state) => ({
      items: state.items,
      subtotal: state.subtotal,
      studentDiscount: state.studentDiscount,
      deliveryFee: state.deliveryFee,
      totalPrice: state.totalPrice,
      clearCart: state.clearCart,
      deliveryLocation: state.deliveryLocation,
      setDeliveryLocation: state.setDeliveryLocation,
      isStudent: state.isStudent,
    })
  );

  const [showOther, setShowOther] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (deliveryLocation && discounts.some(d => d.campus === deliveryLocation)) {
      setShowOther(false);
    } else {
      setShowOther(true);
    }
  }, [deliveryLocation]);

  const initialState: {
    message: string | null;
    errors?: {
      deliveryArea?: string[] | undefined;
      otherDeliveryArea?: string[] | undefined;
      phone_masked?: string[] | undefined;
      email?: string[] | undefined;
    };
    success: boolean;
    authorization_url: string | null;
  } = { message: null, errors: {}, success: false, authorization_url: null };
  const [state, dispatch] = useActionState(createOrderAction, initialState);

  useEffect(() => {
    if (state.success && state.authorization_url) {
      toast({
        title: 'Order Details Confirmed!',
        description: 'Redirecting to secure payment...',
        variant: 'default',
      });
      // Redirect to Paystack for payment
      window.location.href = state.authorization_url;
    } else if (!state.success && state.message) {
        toast({
            title: 'An error occurred',
            description: state.message,
            variant: 'destructive',
        });
    }
  }, [state, toast]);

  const handleLocationChange = (value: string) => {
    if (value === 'Other') {
      setShowOther(true);
      setDeliveryLocation(null);
    } else {
      setShowOther(false);
      setDeliveryLocation(value);
    }
  }

  if (!isMounted) {
    return <OrderFormSkeleton />;
  }

  return (
    <>
      <div className="mt-8">
        <ChatTrigger />
      </div>

      <form ref={formRef} action={dispatch} className="mt-8 space-y-8">
        <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
        <input type="hidden" name="subtotal" value={subtotal} />
        <input type="hidden" name="studentDiscount" value={studentDiscount} />
        <input type="hidden" name="deliveryFee" value={deliveryFee} />
        <input type="hidden" name="totalPrice" value={totalPrice} />
        
        <Card className="bg-card rounded-2xl">
             <CardHeader>
                <CardTitle>Delivery & Payment Details</CardTitle>
                <CardDescription>
                    We only need a location and contact for the delivery rider. Your details are deleted after delivery.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder="e.g., yourname@email.com" 
                                className={cn("pl-10", state.errors?.email && "border-destructive")}
                            />
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                        For payment confirmation from Paystack. We don't store it.
                        </p>
                        {state.errors?.email?.[0] && (
                            <Alert variant="warning" className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {state.errors.email[0]}
                            </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deliveryArea">Delivery Area / Campus *</Label>
                        <Select name="deliveryArea" onValueChange={handleLocationChange} defaultValue={deliveryLocation || "Other"} disabled={!isMounted}>
                        <SelectTrigger className={cn(state.errors?.deliveryArea && "border-destructive")}>
                            <SelectValue placeholder="Select a location..." />
                        </SelectTrigger>
                        <SelectContent>
                                <SelectItem value="Other">Other (Standard Delivery)</SelectItem>
                                {discounts.map(loc => (
                                <SelectItem key={loc.id} value={loc.campus}>{loc.campus}</SelectItem>
                                ))}
                        </SelectContent>
                        </Select>
                        <p className="text-[0.8rem] text-muted-foreground">Select a campus for FREE delivery.</p>
                        {state.errors?.deliveryArea?.[0] && (
                            <Alert variant="warning" className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {state.errors.deliveryArea[0]}
                            </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {showOther && (
                        <div className="space-y-2">
                                <Label htmlFor="otherDeliveryArea">Please Specify Your Location *</Label>
                            <Input 
                                id="otherDeliveryArea" 
                                name="otherDeliveryArea" 
                                placeholder="e.g., Osu, Airport Area" 
                                className={cn(state.errors?.otherDeliveryArea && "border-destructive")}
                                />
                                {state.errors?.otherDeliveryArea?.[0] && (
                                <Alert variant="warning" className="mt-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                    {state.errors.otherDeliveryArea[0]}
                                    </AlertDescription>
                                </Alert>
                                )}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="deliveryAddressNote">Additional Notes for Delivery Agent</Label>
                        <Textarea
                        id="deliveryAddressNote"
                        name="deliveryAddressNote"
                        placeholder="e.g., 'Call upon arrival at the main gate', 'Leave with the security.'"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                        Optional notes to help the rider find you.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                        <Label htmlFor="phone_masked">Contact Number (for delivery rider only) *</Label>
                        </div>
                        <Input 
                        id="phone_masked" 
                        name="phone_masked" 
                        type="tel" 
                        placeholder="e.g., 024xxxxxxx" 
                        className={cn(state.errors?.phone_masked && "border-destructive")}
                        />
                        <p className="text-[0.8rem] text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        This will be masked and is only for the rider to contact you.
                        </p>
                        {state.errors?.phone_masked?.[0] && (
                            <Alert variant="warning" className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {state.errors.phone_masked[0]}
                            </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <Separator />
                
                {items.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Order Summary</h3>
                        {isStudent && (
                            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                                <GraduationCap className="h-5 w-5" />
                                <p className="text-sm font-medium">Student discount (Free Delivery) applied!</p>
                            </div>
                        )}
                        <div className="space-y-4 text-sm">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-12 w-12 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                                        {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(48, 48))}`} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-foreground">GHS {(item.price_ghs * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <p className="text-muted-foreground">Subtotal</p>
                                <p className="font-medium text-foreground">GHS {subtotal.toFixed(2)}</p>
                            </div>
                        {studentDiscount > 0 && (
                            <div className="flex justify-between text-success font-medium">
                                <p>Student Discount (Free Delivery)</p>
                                <p>- GHS {studentDiscount.toFixed(2)}</p>
                            </div>
                            )}
                            <div className="flex justify-between">
                                <p className="text-muted-foreground">Delivery Fee</p>
                                <p className="font-medium text-foreground">GHS {deliveryFee.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <Separator />

                        <div className="flex items-baseline justify-between font-bold text-lg">
                            <p>Total</p>
                            <p className="text-primary">GHS {totalPrice.toFixed(2)}</p>
                        </div>
                    </div>
                )}
                 
                 <Separator />

                <div className="items-top flex space-x-2 pt-2">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                    <div className="grid gap-1.5 leading-none">
                        <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                        By checking this box, you agree to our{' '}
                        <Link href="/terms" className="underline text-primary hover:text-primary/80" target="_blank">
                            Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline text-primary hover:text-primary/80" target="_blank">
                            Privacy Notice
                        </Link>
                        .
                        </label>
                    </div>
                </div>

                 <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-muted-foreground">
                    <Lock className="h-5 w-5 text-success flex-shrink-0" />
                    <p className="text-xs font-medium">Secured via Paystack. Your privacy is guaranteed.</p>
                </div>
            </CardContent>
        </Card>

        
        <SubmitButton disabled={items.length === 0 || !termsAccepted} />
          
      </form>
    </>
  );
}


function OrderFormSkeleton() {
  return (
    <>
      <div className="mt-8">
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted p-6 text-center h-[125px]" />
      </div>
     
      <form className="mt-8 space-y-8 animate-pulse">
        <Card className="bg-card rounded-2xl">
             <CardHeader>
                <div className="h-7 w-1/2 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 w-1/3 bg-muted rounded" />
                        <div className="h-10 w-full bg-muted rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-1/4 bg-muted rounded" />
                        <div className="h-10 w-full bg-muted rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-1/3 bg-muted rounded" />
                        <div className="h-20 w-full bg-muted rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-muted rounded" />
                        <div className="h-10 w-full bg-muted rounded-md" />
                    </div>
                </div>

                <Separator />
                
                 <div className="space-y-4">
                    <div className="h-6 w-1/3 bg-muted rounded" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                </div>
            </CardContent>
        </Card>
        
        <div className="h-11 w-full bg-muted rounded-md" />
      </form>
    </>
  );
}
