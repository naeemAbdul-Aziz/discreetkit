
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, ArrowRight, CheckCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const steps = [
  { name: 'Your Cart', status: 'current' },
  { name: 'Delivery & Payment', status: 'upcoming' },
  { name: 'Confirmation', status: 'upcoming' },
];

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

export default function CartPage() {
    const { items, totalItems, updateQuantity, isStudent, subtotal, deliveryFee, studentDiscount, totalPrice } = useCart();
    const router = useRouter();

    if (totalItems === 0) {
        return (
            <div className="bg-muted">
                <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-24 text-center">
                     <h1 className="font-headline text-3xl font-bold md:text-4xl">Your Cart is Empty</h1>
                    <p className="mt-2 text-base text-muted-foreground md:text-lg">
                        Looks like you haven't added any products yet.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/#products">
                            Browse Products
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-24">
        <div className="text-center">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">Your Cart</h1>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">
                Review your items before proceeding to the final step.
            </p>
        </div>

        {/* Stepper */}
        <nav aria-label="Progress" className="my-12">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : "")}>
                    {step.status === 'complete' || step.status === 'current' ? (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-primary" />
                        </div>
                         <div className={cn("relative flex h-8 w-8 items-center justify-center rounded-full", step.status === 'current' ? 'border-2 border-primary bg-background' : 'bg-primary text-primary-foreground')}>
                            {step.status === 'current' ? 
                                <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" /> :
                                <CheckCircle className="h-5 w-5" />
                            }
                            <span className="sr-only">{step.name}</span>
                        </div>
                    </>
                    ) : (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-border" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background" />
                        <span className="sr-only">{step.name}</span>
                    </>
                    )}
                     <div className="absolute top-10 w-max text-center -translate-x-1/2 left-1/2 max-w-20">
                        <p className={cn("text-xs font-medium", step.status === 'current' ? 'text-primary' : 'text-muted-foreground')}>{step.name}</p>
                    </div>
                </li>
                ))}
            </ol>
        </nav>

        <Card className="shadow-sm overflow-hidden rounded-2xl">
            <CardHeader>
                <CardTitle>Review Your Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-4 sm:gap-6">
                                <div className="relative aspect-square w-[80px] rounded-lg bg-muted overflow-hidden">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2"
                                        data-ai-hint="medical test kit"
                                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(80, 80))}`}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 flex-grow">{item.description}</p>
                                </div>
                                <div className="flex flex-col items-end justify-between self-stretch">
                                    <div className="text-right h-10 flex flex-col justify-center items-end">
                                      {isStudent && item.studentPriceGHS ? (
                                            <>
                                                <p className="font-bold text-success text-base">GHS {(item.studentPriceGHS * item.quantity).toFixed(2)}</p>
                                                <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                                    GHS {(item.priceGHS * item.quantity).toFixed(2)}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="font-bold text-base text-foreground">
                                                GHS {(item.priceGHS * item.quantity).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex h-10 items-center justify-between rounded-full border border-primary/50 bg-background p-1 shadow-sm">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                            </Button>
                                            <span className="w-5 text-center font-bold text-foreground">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="p-6 bg-muted/50">
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
                            <p className="text-muted-foreground">Delivery Fee (estimated)</p>
                            <p className="font-medium text-foreground">GHS {deliveryFee.toFixed(2)}</p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-baseline justify-between font-bold text-lg">
                        <p>Estimated Total</p>
                        <p className="text-primary">GHS {totalPrice.toFixed(2)}</p>
                    </div>
                 </div>
            </CardContent>
        </Card>
        <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={() => router.push('/order')}>
                Proceed to Delivery
                <ArrowRight />
            </Button>
        </div>
      </div>
    </div>
  );
}
