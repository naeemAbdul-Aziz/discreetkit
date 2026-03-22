"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { createOrderAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  AlertTriangle,
  Mail,
  MapPin,
  Lock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BrandSpinner } from "@/components/brand-spinner";
import { useCart } from "@/hooks/use-cart";
import { discounts, DiscountLocation } from "@/lib/data";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function FloatingInput({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, id: string }) {
  return (
    <div className="relative group">
      <Input
        id={id}
        {...props}
        className={cn(
          "peer h-14 bg-muted/30 border-none rounded-xl px-4 pt-5 pb-1 placeholder:text-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-transparent transition-all",
          props.className
        )}
      />
      <Label
        htmlFor={id}
        className="absolute left-4 top-4 text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary cursor-text pointer-events-none"
      >
        {label}
      </Label>
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-14 rounded-xl text-base bg-[#1a254c] hover:bg-[#1a254c]/90 text-white shadow-lg shadow-[#1a254c]/20 hover:shadow-xl hover:shadow-[#1a254c]/30 transition-all active:scale-[0.98]"
      disabled={disabled}
      loading={pending}
    >
      {pending ? (
        "Securing Order..."
      ) : (
        <>
          Proceed to Secure Payment
          <Lock className="w-4 h-4 ml-2 opacity-70" />
        </>
      )}
    </Button>
  );
}

function FormPendingOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BrandSpinner size="sm" />
        Confirming order…
      </div>
    </div>
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
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

function OrderSummaryCard() {
  const {
    items,
    subtotal,
    studentDiscount,
    deliveryFee,
    totalPrice,
    isStudent,
  } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStudent && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
            <GraduationCap className="h-5 w-5" />
            <p className="text-sm font-medium">
              Student discount (Free Delivery) applied!
            </p>
          </div>
        )}
        <div className="space-y-4 text-sm">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      placeholder={`data:image/svg+xml;base64,${toBase64(
                        shimmer(48, 48),
                      )}`}
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">
                  GHS {(item.price_ghs * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Subtotal</p>
            <p className="font-medium text-foreground">
              GHS {subtotal.toFixed(2)}
            </p>
          </div>
          {studentDiscount > 0 && (
            <div className="flex justify-between text-success font-medium">
              <p>Student Discount (Free Delivery)</p>
              <p>- GHS {studentDiscount.toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between">
            <p className="text-muted-foreground">Delivery Fee</p>
            <p className="font-medium text-foreground">
              GHS {deliveryFee.toFixed(2)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-baseline justify-between font-bold text-lg">
          <p>Total</p>
          <p className="text-primary">GHS {totalPrice.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-destructive mt-2 flex items-center gap-1">
      <AlertTriangle className="h-4 w-4" />
      {message}
    </p>
  );
};

export function OrderForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    items,
    subtotal,
    studentDiscount,
    deliveryFee,
    totalPrice,
    clearCart,
    deliveryLocation,
    setDeliveryLocation,
    isStudent,
  } = useCart((state) => ({
    items: state.items,
    subtotal: state.subtotal,
    studentDiscount: state.studentDiscount,
    deliveryFee: state.deliveryFee,
    totalPrice: state.totalPrice,
    clearCart: state.clearCart,
    deliveryLocation: state.deliveryLocation,
    setDeliveryLocation: state.setDeliveryLocation,
    isStudent: state.isStudent,
  }));

  const [showOther, setShowOther] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showNotes, setShowNotes] = useState(false);

  // Geolocation State
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleUseLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest campus
        const MAX_DISTANCE_KM = 5;
        const nearest = discounts.reduce(
          (acc, loc) => {
            if (!loc.coords) return acc;
            const dist = calculateDistance(
              latitude,
              longitude,
              loc.coords.lat,
              loc.coords.lng,
            );
            return dist < acc.dist ? { loc, dist } : acc;
          },
          { loc: null as DiscountLocation | null, dist: Infinity },
        );

        if (nearest.loc && nearest.dist <= MAX_DISTANCE_KM) {
          setDeliveryLocation(nearest.loc.campus);
          toast({
            title: "Location Found",
            description: `You are near ${nearest.loc.campus}. Discount applied!`,
          });
        } else {
          toast({
            title: "Location Found",
            description:
              "No specific campus detected nearby. Please select manually.",
            variant: "default",
          });
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Unable to retrieve location.";
        if (error.code === error.PERMISSION_DENIED)
          msg = "Location permission denied.";
        setLocationError(msg);
        setLocationLoading(false);
        toast({
          title: "Location Error",
          description: msg,
          variant: "destructive",
        });
      },
    );
  };

  // Haversine formula for distance in km
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // radius of earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  useEffect(() => {
    setIsMounted(true);
    if (
      deliveryLocation &&
      discounts.some((d) => d.campus === deliveryLocation)
    ) {
      setShowOther(false);
    } else {
      setShowOther(true);
    }
  }, [deliveryLocation]);

  type CreateOrderState = {
    message: string;
    success: boolean;
    authorization_url: string | null;
    errors?: Record<string, string[]>;
  };

  const initialState: CreateOrderState = {
    message: "",
    errors: {},
    success: false,
    authorization_url: null,
  };

  const [state, dispatch] = useActionState<CreateOrderState, FormData>(
    createOrderAction as unknown as (
      state: CreateOrderState,
      payload: FormData,
    ) => Promise<CreateOrderState>,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.authorization_url) {
      toast({
        title: "Order Details Confirmed!",
        description: "Redirecting to secure payment...",
        variant: "default",
      });
      // Redirect to Paystack for payment
      window.location.href = state.authorization_url;
    } else if (!state.success && state.message) {
      // Display specific field errors if they exist, otherwise show general message
      if (!state.errors || Object.keys(state.errors).length === 0) {
        toast({
          title: "An error occurred",
          description: state.message,
          variant: "destructive",
        });
      }
      
      // Auto-revert to Step 1 if there's a location error returned from server
      if (state.errors?.deliveryArea || state.errors?.otherDeliveryArea) {
        setStep(1);
      }
    }
  }, [state, toast]);

  const handleLocationChange = (value: string) => {
    if (value === "Other") {
      setShowOther(true);
      setDeliveryLocation(null);
    } else {
      setShowOther(false);
      setDeliveryLocation(value);
    }
  };

  if (!isMounted) {
    return <OrderFormSkeleton />;
  }

  const isSubmitDisabled = items.length === 0;

  return (
    <>
      <div className="max-w-xl mx-auto w-full mt-4 lg:mt-8">
        <form ref={formRef} action={dispatch} className="space-y-6 relative overflow-hidden pb-4">
          <FormPendingOverlay />
          <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
          <input type="hidden" name="subtotal" value={subtotal} />
          <input type="hidden" name="studentDiscount" value={studentDiscount} />
          <input type="hidden" name="deliveryFee" value={deliveryFee} />
          <input type="hidden" name="totalPrice" value={totalPrice} />

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                 key="step1"
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 exit={{ x: -20, opacity: 0 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className="space-y-6"
              >
                <div className="px-1">
                  <h2 className="text-3xl font-bold tracking-tight">Where to?</h2>
                  <p className="text-muted-foreground mt-1 text-base">Tell us where to drop your package off.</p>
                </div>

                <div className="space-y-5">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-16 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary justify-start gap-4 relative overflow-hidden group"
                    onClick={handleUseLocation}
                    disabled={locationLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    {locationLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin ml-2" />
                    ) : (
                      <div className="h-10 w-10 ml-1 rounded-full bg-primary/10 flex items-center justify-center">
                         <MapPin className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col items-start leading-tight">
                      <span className="font-semibold text-base">Find nearest campus</span>
                      <span className="text-xs font-normal opacity-80">Auto-detect location for discounts</span>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-auto text-primary/50 group-hover:text-primary transition-colors" />
                  </Button>

                  <div className="relative flex items-center gap-4 py-1">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or select manually</span>
                    <Separator className="flex-1" />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Select
                        name="deliveryArea"
                        onValueChange={handleLocationChange}
                        value={deliveryLocation || "Other"}
                        disabled={!isMounted}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-14 bg-muted/30 border-none rounded-xl px-4 focus:ring-1 focus:ring-primary focus:bg-transparent text-base",
                            state.errors?.deliveryArea && "ring-1 ring-destructive"
                          )}
                        >
                          <SelectValue placeholder="Select a location..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Other">Standard Delivery anywhere</SelectItem>
                          {discounts.map((loc) => (
                            <SelectItem key={loc.id} value={loc.campus}>
                              {loc.campus}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={state.errors?.deliveryArea?.[0]} />
                    </div>

                    {showOther ? (
                      <div className="space-y-1.5">
                        <FloatingInput
                          id="otherDeliveryArea"
                          name="otherDeliveryArea"
                          label="Exact Delivery Address"
                          placeholder=" "
                          className={cn(state.errors?.otherDeliveryArea && "ring-1 ring-destructive")}
                        />
                        <FieldError message={state.errors?.otherDeliveryArea?.[0]} />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Select name="otherDeliveryArea">
                          <SelectTrigger
                            className={cn(
                              "h-14 bg-muted/30 border-none rounded-xl px-4 focus:ring-1 focus:ring-primary focus:bg-transparent text-base",
                              state.errors?.otherDeliveryArea && "ring-1 ring-destructive"
                            )}
                          >
                            <SelectValue placeholder="Select specific pickup point..." />
                          </SelectTrigger>
                          <SelectContent>
                            {discounts
                              .find((d) => d.campus === deliveryLocation)
                              ?.meetingPoints?.map((point) => (
                                <SelectItem key={point} value={point}>
                                  {point}
                                </SelectItem>
                              ))}
                            <SelectItem value="Other">Other (Specify in notes)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError message={state.errors?.otherDeliveryArea?.[0]} />
                      </div>
                    )}

                    <div className="pt-2 pb-2">
                      {!showNotes ? (
                        <button 
                          type="button"
                          onClick={() => setShowNotes(true)} 
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          + Add delivery instructions
                        </button>
                      ) : (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Textarea
                            id="deliveryAddressNote"
                            name="deliveryAddressNote"
                            placeholder="e.g. Call upon arrival, leave at main gate..."
                            className="min-h-[100px] bg-muted/30 border-none rounded-xl p-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-transparent transition-all resize-none"
                          />
                        </div>
                      )}
                    </div>

                    <Button 
                      type="button" 
                      className="w-full h-14 rounded-xl text-base mt-2 shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold"
                      onClick={() => setStep(2)}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                 key="step2"
                 initial={{ x: 20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 exit={{ x: 20, opacity: 0 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className="space-y-6"
              >
                <div className="flex items-start gap-4 mb-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-muted/70 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Secure Contact</h2>
                    <p className="text-muted-foreground mt-1 text-base">Where should we send your tracking link?</p>
                  </div>
                </div>

                <div className="space-y-5 bg-card border border-border/50 rounded-3xl p-1 shadow-sm">
                  <div className="p-4 space-y-5">
                     <div className="space-y-1.5">
                        <FloatingInput
                          id="email"
                          name="email"
                          type="email"
                          label="Receipt Email Address"
                          placeholder=" "
                          className={cn(state.errors?.email && "ring-1 ring-destructive")}
                        />
                        <FieldError message={state.errors?.email?.[0]} />
                     </div>
                     
                     <div className="space-y-1.5">
                        <FloatingInput
                          id="phone_masked"
                          name="phone_masked"
                          type="tel"
                          label="Rider Contact Number"
                          placeholder=" "
                          className={cn(state.errors?.phone_masked && "ring-1 ring-destructive")}
                        />
                        <FieldError message={state.errors?.phone_masked?.[0]} />
                        <p className="text-[0.75rem] text-muted-foreground/80 flex items-center gap-1.5 mt-2 ml-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-success/80" />
                          Your number is permanently masked. The rider will not see your real details.
                        </p>
                     </div>
                  </div>
                </div>

                <div className="pt-2 pb-2">
                  <h3 className="text-lg font-bold px-1 mb-3">Order Summary</h3>
                  <OrderSummaryCard />
                  <div className="flex items-center gap-2 rounded-xl bg-[#1a254c]/5 p-4 mt-3 text-muted-foreground border border-[#1a254c]/10">
                    <Lock className="h-5 w-5 text-[#1a254c] flex-shrink-0" />
                    <p className="text-xs font-medium text-[#1a254c]/80">
                      Secured via Paystack. Your privacy is guaranteed.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <SubmitButton disabled={isSubmitDisabled} />
                  <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed px-4">
                    By proceeding to payment, you agree to our <Link href="/terms" className="underline hover:text-foreground transition-colors" target="_blank">Terms & Conditions</Link> and <Link href="/privacy" className="underline hover:text-foreground transition-colors" target="_blank">Privacy Notice</Link>.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
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
