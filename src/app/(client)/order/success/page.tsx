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
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Sub-component: Code display pill with copy functionality
   Matches the warm-grey input style from checkout
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
      'rounded-2xl border-0 px-5 py-4 text-left w-full transition-all duration-300',
      accent
        ? 'bg-primary/10'
        : 'bg-[#f5f5f1]'
    )}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
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
            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-sm border-0 text-muted-foreground hover:text-primary transition-all active:scale-90"
            aria-label="Copy code"
          >
            {copied
              ? <Icon name="check" className="text-primary" opticalSize={18} weight={700} />
              : <Icon name="content_copy" className="text-muted-foreground" opticalSize={18} />}
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
          <Icon name="error" className="text-destructive" opticalSize={32} fill={true} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive">Payment Issue</h1>
          <p className="text-[14px] text-muted-foreground mt-2 max-w-[280px] mx-auto leading-relaxed">
            We couldn't confirm your payment. Contact support if you believe this is a mistake.
          </p>
        </div>
        <Button asChild className="w-full rounded-full h-12 font-bold bg-destructive hover:bg-destructive/90">
          <Link href="/order">Try Again</Link>
        </Button>
      </div>
    );
  }

  /* ── Pending state ── */
  if (paymentStatus === 'pending') {
    return (
      <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto">
        <div className="h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
          <Icon name="warning" className="text-yellow-500" opticalSize={40} fill={true} />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Pending</h1>
          <p className="text-base text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
            Your payment is still processing. Check back in a few minutes.
          </p>
        </div>
        <div className="w-full bg-white rounded-[2rem] shadow-lg p-6 mb-8">
          <CodeBlock label="Tracking Code" value={code} onCopy={handleCopy} copied={isCopied} />
        </div>
        <div className="w-full px-4 space-y-3">
          <Button asChild className="w-full h-14 rounded-full font-bold">
            <Link href={`/track?code=${code}`}>
              <Icon name="local_shipping" className="mr-2" opticalSize={20} />
              Check History
            </Link>
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-full border border-border" onClick={() => window.location.reload()}>
            <Icon name="refresh" className="mr-2" opticalSize={18} />
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  /* ── Success state ── */
  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto">
      
      {/* Icon Section */}
      <div className="mb-8 relative">
        <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center relative z-10">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Icon name="check" className="text-white" opticalSize={32} weight={700} />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full animate-pulse -z-0" />
      </div>

      {/* Hero Header */}
      <div className="mb-10 px-4">
        <h1 className="text-4xl font-bold tracking-tight mb-3">You're all set.</h1>
        <p className="text-base text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
          Your order is confirmed. Delivered in a discreet, unbranded package.
        </p>
      </div>

      {/* Main Content Card - Rounded-[2rem] shadow-lg like checkout */}
      <div className="w-full bg-white rounded-[2rem] shadow-lg border-0 overflow-hidden mb-8">
        {/* Codes Area */}
        <div className="p-6 space-y-4">
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

        {/* Separator */}
        <div className="h-[1px] w-full bg-[#f5f5f1] mx-auto" />

        {/* What happens next - Warm grey section */}
        <div className="bg-[#f5f5f1]/50 p-6 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 ml-1">
            Status Update
          </p>
          <div className="space-y-4">
            {[
              "Our partner pharmacy is preparing your order.",
              "Your kit ships in a discreet, unbranded package.",
              "Track real-time updates using your code above.",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground/80 leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full px-4 space-y-4">
        <Button asChild className="w-full h-14 rounded-full font-bold shadow-md text-base">
          <Link href={`/track?code=${code}`}>
            <Icon name="local_shipping" className="mr-2" opticalSize={20} />
            Track Your Order
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full h-12 rounded-full text-muted-foreground hover:text-foreground">
          <Link href="/">
            <Icon name="home" className="mr-2" opticalSize={18} />
            Back to Home
          </Link>
        </Button>
      </div>

      {orderData?.partnerCode && (
        <div className="mt-8">
          <Link
            href="/partner-care"
            className="inline-flex items-center text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            Learn about your partner care benefits
            <Icon name="arrow_forward" className="ml-1" opticalSize={18} />
          </Link>
        </div>
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
    <div className="flex min-h-[calc(100dvh-4rem)] items-start md:items-center justify-center bg-background px-4 py-12 md:py-20">
      <Suspense fallback={<SuccessPageLoading />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
