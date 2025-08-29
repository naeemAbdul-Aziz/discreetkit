
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrderAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, ArrowRight, Plus, Minus, GraduationCap } from 'lucide-react';
import { ChatTrigger } from '@/components/chat-trigger';
import { useCart } from '@/hooks/use-cart';
import { products, discounts, type Product } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Processing...' : 'Proceed to Payment'}
      {!pending && <ArrowRight />}
    </Button>
  );
}

function AddToCartButton({ product }: { product: Product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
        <Button variant="outline" className="w-24 justify-center rounded-full" disabled>
            <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
    )
  }

  const quantity = getItemQuantity(product.id);

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(product.id, quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center font-bold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(product.id, quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-24 justify-center rounded-full"
      onClick={() => addItem(product)}
    >
      <Plus className="mr-2 h-4 w-4" /> Add
    </Button>
  );
}

function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { items, subtotal, studentDiscount, deliveryFee, totalPrice, clearCart, deliveryLocation, setDeliveryLocation } = useCart();
  const [showOther, setShowOther] = useState(!isStudentLocation(deliveryLocation));
  
  const isStudent = deliveryLocation && discounts.some(d => d.campus === deliveryLocation);

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
    } else if (state.message && !state.success && !state.errors) {
      toast({
        title: 'An error occurred',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast, clearCart]);


  const handleLocationChange = (value: string) => {
    if (value === 'Other') {
      setShowOther(true);
      setDeliveryLocation(null);
    } else {
      setShowOther(false);
      setDeliveryLocation(value);
    }
  }

  // A helper function to determine if a location is a student location
  function isStudentLocation(location: string | null): boolean {
    if (!location) return false;
    return discounts.some(d => d.campus === location);
  }


  return (
    <>
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">Complete Your Order</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Add items to your cart and fill out the delivery details below.
        </p>
      </div>

      <div className="mt-8">
        <ChatTrigger />
      </div>

      <form ref={formRef} action={dispatch} className="mt-8 space-y-8">
        <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
        <input type="hidden" name="subtotal" value={subtotal} />
        <input type="hidden" name="studentDiscount" value={studentDiscount} />
        <input type="hidden" name="deliveryFee" value={deliveryFee} />
        <input type="hidden" name="totalPrice" value={totalPrice} />


        <Card>
          <CardHeader>
            <CardTitle>1. Choose Your Products</CardTitle>
            <CardDescription>Add or adjust items in your cart. Student pricing is applied automatically for campus deliveries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    data-ai-hint="medical test kit"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                   <div className="mt-1.5 flex items-baseline gap-2">
                        <p className={cn(
                            "font-semibold",
                            isStudent && product.studentPriceGHS ? "text-muted-foreground line-through text-sm" : "text-base"
                        )}>
                            GHS {product.priceGHS.toFixed(2)}
                        </p>
                        {isStudent && product.studentPriceGHS && (
                            <p className="font-semibold text-green-600 text-base">GHS {product.studentPriceGHS.toFixed(2)}</p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <AddToCartButton product={product} />
                </div>
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
                  <Label htmlFor="deliveryArea">Delivery Area / Campus *</Label>
                  <Select name="deliveryArea" onValueChange={handleLocationChange} defaultValue={deliveryLocation || "Other"}>
                    <SelectTrigger className={cn(state.errors?.deliveryArea && "border-destructive")}>
                        <SelectValue placeholder="Select a location..." />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="Other">Other (Standard Delivery)</SelectItem>
                         {discounts.map(loc => (
                           <SelectItem key={loc.id} value={loc.campus}>{loc.campus} (Student Discount)</SelectItem>
                         ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.deliveryArea && (
                    <p className="text-sm font-medium text-destructive">{state.errors.deliveryArea[0]}</p>
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
                         {state.errors?.otherDeliveryArea && (
                            <p className="text-sm font-medium text-destructive">{state.errors.otherDeliveryArea[0]}</p>
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
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="phone_masked">Contact Number (for delivery rider only) *</Label>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="phone_masked" 
                    name="phone_masked" 
                    type="tel" 
                    placeholder="e.g., 024xxxxxxx" 
                    className={cn(state.errors?.phone_masked && "border-destructive")}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    This will be masked and is only for the rider to contact you.
                  </p>
                  {state.errors?.phone_masked && (
                    <p className="text-sm font-medium text-destructive">{state.errors.phone_masked[0]}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center">Your cart is empty. Add a product to see a summary.</p>
                ) : (
                  <div className="space-y-4">
                    {isStudent && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                            <GraduationCap className="h-5 w-5" />
                            <p className="text-sm font-medium">Student discount applied!</p>
                        </div>
                    )}
                    <div className="space-y-2 text-sm">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <p className="text-muted-foreground">{item.name} <span className="text-xs">x{item.quantity}</span></p>
                          <p>GHS {(item.priceGHS * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Subtotal</p>
                          <p>GHS {subtotal.toFixed(2)}</p>
                        </div>
                       {studentDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <p>Student Discount</p>
                            <p>- GHS {studentDiscount.toFixed(2)}</p>
                          </div>
                        )}
                         <div className="flex justify-between">
                          <p className="text-muted-foreground">Delivery Fee</p>
                          <p>GHS {deliveryFee.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between font-bold text-lg">
                      <p>Total</p>
                      <p>GHS {totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <SubmitButton disabled={items.length === 0} />
          
      </form>
    </>
  );
}

function OrderPageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function OrderPage() {
  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
        <Suspense fallback={<OrderPageLoading />}>
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}
