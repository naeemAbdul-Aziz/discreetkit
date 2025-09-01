
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
import { Loader2, ShieldCheck, ArrowRight, Plus, Minus, GraduationCap, Check, AlertTriangle } from 'lucide-react';
import { ChatTrigger } from '@/components/chat-trigger';
import { useCart } from '@/hooks/use-cart';
import { products, discounts, type Product } from '@/lib/data';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={pending || disabled}>
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
    return <div className="h-10 w-full rounded-full bg-muted animate-pulse" />;
  }

  const quantity = getItemQuantity(product.id);

  if (quantity > 0) {
    return (
        <div className="flex h-10 items-center justify-between rounded-full border border-primary/50 p-1">
            <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
            onClick={() => updateQuantity(product.id, quantity - 1)}
            >
            <Minus className="h-4 w-4" />
            </Button>
            <span className="w-5 text-center font-bold text-foreground">{quantity}</span>
            <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
            onClick={() => updateQuantity(product.id, quantity + 1)}
            >
            <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
  }

  return (
    <Button
      className="w-full rounded-full"
      onClick={() => addItem(product)}
      variant="outline"
    >
      Add to Cart
      <Plus />
    </Button>
  );
}

function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { items, subtotal, studentDiscount, deliveryFee, totalPrice, clearCart, deliveryLocation, setDeliveryLocation, getItemQuantity } = useCart();
  const [showOther, setShowOther] = useState(true);
  
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    // Initialize showOther based on hydrated cart state
    if (deliveryLocation && discounts.some(d => d.campus === deliveryLocation)) {
      setShowOther(false);
    } else {
      setShowOther(true);
    }
  }, [deliveryLocation]);
  
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


        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Choose Your Products</h2>
            <div className="space-y-4">
                {products.map((product) => {
                    const quantity = isMounted ? getItemQuantity(product.id) || 1 : 1;
                    const isProductInCart = isMounted ? getItemQuantity(product.id) > 0 : false;
                    
                    return (
                     <Card key={product.id} className="shadow-lg overflow-hidden transition-all hover:shadow-xl">
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-[80px_1fr_auto] gap-4 sm:gap-6 items-center">
                                <div className="relative aspect-square w-full sm:w-[80px] rounded-lg bg-muted overflow-hidden">
                                    <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-2"
                                    data-ai-hint="medical test kit"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-base font-bold text-foreground">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-success">
                                        <Check className="h-3.5 w-3.5" />
                                        <p>WHO Approved</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-between self-stretch">
                                    <div className="text-right h-10 flex flex-col justify-center items-end">
                                      {!isMounted ? (
                                        <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
                                      ) : isStudent && product.studentPriceGHS ? (
                                            <>
                                                <p className="font-bold text-success text-base">GHS {(product.studentPriceGHS * quantity).toFixed(2)}</p>
                                                {isProductInCart && (
                                                    <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                                        GHS {(product.priceGHS * quantity).toFixed(2)}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="font-bold text-base text-foreground">
                                                GHS {(product.priceGHS * quantity).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-32 mt-2">
                                       <AddToCartButton product={product} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )})}
            </div>
        </div>
        
        <Card className="bg-card shadow-lg">
            <CardHeader>
            <CardTitle>2. Delivery Information</CardTitle>
            <CardDescription>
                We only need a location and contact for the delivery rider. Your details are deleted after delivery.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="deliveryArea">Delivery Area / Campus *</Label>
                <Select name="deliveryArea" onValueChange={handleLocationChange} defaultValue={deliveryLocation || "Other"} disabled={!isMounted}>
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
            </CardContent>
        </Card>

        <Card className="bg-card shadow-lg">
            <CardHeader>
                <CardTitle>3. Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {!isMounted ? (
                 <div className="flex items-center justify-center py-4">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
              ) : items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your cart is empty. Add a product to see a summary.</p>
                ) : (
                <div className="space-y-4">
                    {isStudent && (
                        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                            <GraduationCap className="h-5 w-5" />
                            <p className="text-sm font-medium">Student discount applied!</p>
                        </div>
                    )}
                    <div className="space-y-4 text-sm">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{item.name}</p>
                                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {isStudent && item.studentPriceGHS ? (
                                    <>
                                        <p className="font-bold text-success">GHS {(item.studentPriceGHS * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground/80 line-through">GHS {(item.priceGHS * item.quantity).toFixed(2)}</p>
                                    </>
                                ) : (
                                    <p className="font-medium text-foreground">GHS {(item.priceGHS * item.quantity).toFixed(2)}</p>
                                )}
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
                            <p>Student Discount</p>
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

                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-muted-foreground">
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                        <p className="text-xs font-medium">Your privacy is guaranteed. All orders are sent in plain, discreet packaging.</p>
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
        
        <SubmitButton disabled={!isMounted || items.length === 0} />
          
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
      <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20">
        <Suspense fallback={<OrderPageLoading />}>
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}

    