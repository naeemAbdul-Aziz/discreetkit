
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, Truck, Home, Plus, Check, AlertCircle } from 'lucide-react';
import { BrandSpinner } from '@/components/brand-spinner';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCart } from '@/hooks/use-cart';
import { getOrderAction } from '@/lib/actions';

function SuccessContent() {
  const searchParams = useSearchParams();
  // Paystack returns 'reference' or 'trxref' in the query string
  const code = searchParams.get('reference') || searchParams.get('trxref');
  const { toast } = useToast();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!code) {
        setIsVerifying(false);
        setPaymentStatus('failed');
        return;
      }
      try {
        // Small delay to give webhook a head start
        await new Promise(r => setTimeout(r, 1500));
        
        // First, try to verify the payment with Paystack
        const res = await fetch(`/api/payment/verify?reference=${encodeURIComponent(code)}`, { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        
        if (cancelled) return;
        
        // Check if verification was successful
        const verifiedOk = res.ok && data?.ok;
        
        if (verifiedOk) {
          // Payment verified successfully
          setPaymentStatus('success');
          setIsConfirmed(true);
        } else {
          // Verification failed or returned error - check order status directly
          // This covers the case where webhook already processed the payment
          const order = await getOrderAction(code);
          
          if (order) {
            if (order.status !== 'pending_payment') {
              // Payment was already confirmed (likely by webhook)
              setPaymentStatus('success');
              setIsConfirmed(true);
            } else {
              // Payment is still pending - show pending status
              setPaymentStatus('pending');
            }
          } else {
            // Order not found
            setPaymentStatus('failed');
          }
        }
      } catch (e) {
        console.error('Payment verification error:', e);
        // On error, check order status as fallback
        try {
          const order = await getOrderAction(code);
          if (order && order.status !== 'pending_payment') {
            setPaymentStatus('success');
            setIsConfirmed(true);
          } else {
            setPaymentStatus('pending');
          }
        } catch {
          setPaymentStatus('pending');
        }
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    };
    verify();
    return () => { cancelled = true };
  }, [code]);

  // Clear the cart once payment is confirmed (verify or webhook path)
  useEffect(() => {
    if (paymentStatus === 'success' && isConfirmed && !clearedRef.current) {
      try {
        clearCart();
        clearedRef.current = true;
        toast({ title: 'Cart cleared', description: 'Your cart has been cleared after successful payment.' });
      } catch {}
    }
  }, [paymentStatus, isConfirmed, clearCart, toast]);

  if (isVerifying) {
    return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader className="items-center">
                <BrandSpinner size="lg" />
                <CardTitle className="mt-4 text-3xl">Verifying Payment...</CardTitle>
                <CardDescription className="max-w-md">
                    Please wait a moment while we confirm your transaction. Do not close this page.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  if (!code || paymentStatus === 'failed') {
    return (
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <CardTitle className="mt-4 text-2xl text-destructive">Payment Issue</CardTitle>
            <CardDescription>
                There seems to be an issue with your payment or order code. Please check your confirmation or contact support if you believe this is an error.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/order">
              <Plus />
              Place a New Order
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
            <CardTitle className="mt-4 text-2xl">Payment Pending</CardTitle>
            <CardDescription className="max-w-md">
                Your payment is still being processed. This usually takes a few moments. Please check your order status using the tracking code below, or contact support if the issue persists.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Tracking Code:</p>
            <div className="mt-2 flex items-center justify-center rounded-lg border bg-muted p-3">
              <p className="text-xl font-bold tracking-widest text-foreground">{code}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/track?code=${code}`}>
                <Truck />
                Check Order Status
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/partner-care">
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your tracking code has been copied.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader className="items-center">
        <CheckCircle2 className="h-16 w-16 text-success" />
        <CardTitle className="mt-4 text-3xl">Order Confirmed!</CardTitle>
        <CardDescription className="max-w-md">
          Your order has been successfully placed. Your privacy is our priority, and your details are secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Your Unique Tracking Code:</p>
          <div className="mt-2 flex items-center justify-center rounded-lg border bg-muted p-3">
            <p className="text-2xl font-bold tracking-widest text-foreground">{code}</p>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="ml-4">
              {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              <span className="sr-only">Copy tracking code</span>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Keep this code safe. You'll need it to track your order.
          </p>
        </div>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href={`/track?code=${code}`}>
              <Truck />
              Track Your Order Now
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
                <Home />
                Back to Homepage
            </Link>
          </Button>
        </div>
         <div className="text-sm text-muted-foreground pt-4">
            <h3 className="font-semibold text-foreground">What's Next?</h3>
            <ol className="text-left list-decimal list-inside mt-2 space-y-1">
                <li>We'll start processing your order.</li>
                <li>You'll see status updates on the tracking page.</li>
                <li>Your kit will be delivered in a discreet, unbranded package.</li>
            </ol>
        </div>
      </CardContent>
    </Card>
  );
}

function SuccessPageLoading() {
    return (
        <div className="flex h-64 items-center justify-center">
            <BrandSpinner size="md" />
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center bg-background p-4">
            <Suspense fallback={<SuccessPageLoading />}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
