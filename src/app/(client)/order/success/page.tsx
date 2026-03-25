'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandSpinner } from '@/components/brand-spinner';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { getOrderAction } from '@/lib/actions';
import { type Order } from '@/lib/data';
import { CheckCircle2, Copy, Check, AlertCircle, Truck, Home, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Sub-component: Code display pill with copy functionality
───────────────────────────────────────────────────────── */
function CodeBlock({
  label,
  value,
  onCopy,
  copied,
  accent = false,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      'rounded-2xl border px-5 py-4 text-left w-full',
      accent
        ? 'border-primary/20 bg-primary/5'
        : 'border-border/40 bg-muted/30'
    )}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-center justify-between gap-4">
        <p className={cn(
          'font-mono text-xl font-bold tracking-widest',
          accent ? 'text-primary' : 'text-foreground'
        )}>
          {value}
        </p>
        {onCopy && (
          <button
            onClick={onCopy}
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy code"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-success" />
              : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main success content
───────────────────────────────────────────────────────── */
function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('reference') || searchParams.get('trxref');
  const { toast } = useToast();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    const maxAttempts = 20;

    const checkStatus = async () => {
      if (!active || !code || isConfirmed || attempts >= maxAttempts) return;
      try {
        const order = await getOrderAction(code);
        if (order && order.status !== 'pending_payment') {
          setPaymentStatus('success');
          setIsConfirmed(true);
          setOrderData(order);
          return;
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
      attempts++;
      if (active && !isConfirmed && attempts < maxAttempts) {
        setTimeout(checkStatus, 3000);
      } else if (attempts >= maxAttempts && !isConfirmed && paymentStatus !== 'success') {
        setIsVerifying(false);
        if (!paymentStatus) setPaymentStatus('pending');
      }
    };

    const initialVerify = async () => {
      try {
        const safeCode = code || '';
        const res = await fetch(`/api/payment/verify?reference=${encodeURIComponent(safeCode)}`, { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.ok) {
          setPaymentStatus('success');
          setIsConfirmed(true);
          setIsVerifying(false);
          if (safeCode) {
            const order = await getOrderAction(safeCode);
            if (order) setOrderData(order);
          }
          return;
        }
      } catch (e) {
        console.warn('Initial verify failed, falling back to polling', e);
      }
      checkStatus();
    };

    if (code && !isConfirmed) initialVerify();
    return () => { active = false; };
  }, [code, isConfirmed]);

  useEffect(() => {
    if (paymentStatus === 'success' && isConfirmed && !clearedRef.current) {
      try {
        clearCart();
        clearedRef.current = true;
      } catch {}
    }
  }, [paymentStatus, isConfirmed, clearCart]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({ title: 'Copied', description: 'Tracking code copied to clipboard.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  /* ── Verifying state ── */
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center text-center gap-5">
        <BrandSpinner size="lg" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verifying Payment</h1>
          <p className="text-[14px] text-muted-foreground mt-1.5 max-w-[260px] mx-auto">
            Hang tight — this only takes a second.
          </p>
        </div>
      </div>
    );
  }

  /* ── Failed / No code state ── */
  if (!code || paymentStatus === 'failed') {
    return (
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-[360px]">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Issue</h1>
          <p className="text-[14px] text-muted-foreground mt-2 max-w-[280px] mx-auto leading-relaxed">
            We couldn't confirm your payment. Contact support if you believe this is a mistake.
          </p>
        </div>
        <Button asChild className="w-full rounded-full h-12 font-bold">
          <Link href="/order">Try Again</Link>
        </Button>
      </div>
    );
  }

  /* ── Pending state ── */
  if (paymentStatus === 'pending') {
    return (
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-[380px]">
        <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Pending</h1>
          <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
            Your payment is still processing. Use your tracking code to check your order status.
          </p>
        </div>
        <CodeBlock label="Tracking Code" value={code} onCopy={handleCopy} copied={isCopied} />
        <div className="w-full space-y-3">
          <Button asChild className="w-full rounded-full h-12 font-bold">
            <Link href={`/track?code=${code}`}>
              <Truck className="h-4 w-4 mr-2" />
              Check Order Status
            </Link>
          </Button>
          <Button variant="outline" className="w-full rounded-full h-12" onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  /* ── Success state ── */
  return (
    <div className="flex flex-col items-center text-center gap-7 w-full max-w-[400px]">
      
      {/* Icon */}
      <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">You're all set.</h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-[300px] mx-auto leading-relaxed">
          Your order is confirmed. Delivered in a discreet, unbranded package.
        </p>
      </div>

      {/* Codes */}
      <div className="w-full space-y-3">
        <CodeBlock
          label="Order Tracking Code"
          value={code}
          onCopy={handleCopy}
          copied={isCopied}
        />
        {orderData?.partnerCode && (
          <CodeBlock
            label="Partner Access Code · Marie Stopes"
            value={orderData.partnerCode}
            accent
          />
        )}
      </div>

      {/* What happens next — stripped to 3 clean lines */}
      <div className="w-full text-left bg-muted/30 border border-border/40 rounded-2xl px-5 py-4 space-y-2">
        {[
          "We'll start preparing your order now.",
          "Your kit ships in a discreet, unbranded package.",
          "Track real-time updates with your code above.",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-[11px] font-bold text-muted-foreground/60 mt-0.5 w-4 shrink-0">{`0${i + 1}`}</span>
            <p className="text-[13px] text-muted-foreground leading-snug">{step}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="w-full space-y-3">
        <Button asChild className="w-full h-12 rounded-full font-bold">
          <Link href={`/track?code=${code}`}>
            <Truck className="h-4 w-4 mr-2" />
            Track Your Order
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full h-12 rounded-full text-muted-foreground">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {orderData?.partnerCode && (
        <Link
          href="/partner-care"
          className="text-[12px] text-primary hover:underline"
        >
          Learn about your partner care benefits →
        </Link>
      )}
    </div>
  );
}

function SuccessPageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <BrandSpinner size="md" />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<SuccessPageLoading />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
