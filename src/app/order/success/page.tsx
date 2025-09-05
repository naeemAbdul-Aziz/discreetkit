
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, Truck, Home, Plus, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  if (!code) {
    return (
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Order Not Found</CardTitle>
          <CardDescription>
            No order code was provided. Please check your confirmation or contact support if you believe this is an error.
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
    <Card className="w-full max-w-lg text-center shadow-xl">
      <CardHeader className="items-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
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
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-muted p-4">
            <Suspense fallback={<SuccessPageLoading />}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
