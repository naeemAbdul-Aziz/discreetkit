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

function LabelledInput({
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
}) {
  return (
    <div className="space-y-2 w-full">
      <Label
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1"
      >
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className={cn(
          "h-12 rounded-2xl border-0 bg-[#f5f5f1] px-5 transition-all focus-visible:ring-primary/20 text-sm shadow-none",
          props.className,
        )}
      />
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-12 md:h-14 rounded-full text-[15px] md:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.98]"
      disabled={disabled}
      loading={pending}
    >
      {pending ? (
        "Processing..."
      ) : (
        <>
          Proceed to Payment
          <ArrowRight className="h-4 w-4 ml-1.5" />
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
  } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 rounded-xl bg-background/60 overflow-hidden flex-shrink-0">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-tight text-foreground truncate">{item.name}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">Qty {item.quantity}</p>
              </div>
            </div>
            <p className="text-[13px] font-bold text-foreground shrink-0 whitespace-nowrap">GHS {(item.price_ghs * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border/15 space-y-2 text-[13px]">
        <div className="flex justify-between text-muted-foreground">
          <p>Subtotal</p>
          <p className="text-foreground">GHS {subtotal.toFixed(2)}</p>
        </div>
        {studentDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <p>Student Discount</p>
            <p>- GHS {studentDiscount.toFixed(2)}</p>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <p>Delivery</p>
          <p className="text-foreground">GHS {deliveryFee.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/10 flex items-center justify-between">
        <p className="text-[13px] font-bold text-foreground">Total</p>
        <p className="text-[15px] font-black text-primary tracking-tight">GHS {totalPrice.toFixed(2)}</p>
      </div>
    </div>
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
    <div className="bg-background min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Progress indicator — minimal pill stepper */}
        <div className="flex items-center justify-center gap-1.5 pt-8 pb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                "h-[3px] rounded-full transition-all duration-500",
                step >= s ? "w-8 bg-primary" : "w-3 bg-muted"
              )}
            />
          ))}
        </div>

        <Card className="border-0 shadow-none bg-card rounded-3xl mx-4 overflow-hidden">
          <form
            ref={formRef}
            action={dispatch}
            className="relative"
          >
            <FormPendingOverlay />
            <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
            <input type="hidden" name="subtotal" value={subtotal} />
            <input type="hidden" name="studentDiscount" value={studentDiscount} />
            <input type="hidden" name="deliveryFee" value={deliveryFee} />
            <input type="hidden" name="totalPrice" value={totalPrice} />

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pt-8 pb-8 space-y-7"
                >
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Delivery</h2>
                      <p className="text-[13px] text-muted-foreground mt-1">Where should we drop this off?</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5 w-full">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
                          Campus / Location
                        </Label>
                        <Select
                          name="deliveryArea"
                          onValueChange={handleLocationChange}
                          value={deliveryLocation || "Other"}
                          disabled={!isMounted}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-12 rounded-2xl border-0 bg-[#f5f5f1] px-5 text-sm ring-0 focus:ring-primary/20",
                              state.errors?.deliveryArea && "border border-destructive",
                            )}
                          >
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="Other">Standard Delivery</SelectItem>
                            {discounts.map((d) => (
                              <SelectItem key={d.id} value={d.campus}>{d.campus}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={state.errors?.deliveryArea?.[0]} />
                      </div>

                      {showOther ? (
                        <LabelledInput
                          id="otherDeliveryArea"
                          name="otherDeliveryArea"
                          label="Exact Address"
                          placeholder="e.g. Accra Mall, Spintex Road"
                          className={cn(state.errors?.otherDeliveryArea && "ring-1 ring-destructive")}
                        />
                      ) : (
                        <div className="space-y-1.5 w-full">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
                            Pickup Point
                          </Label>
                          <Select name="otherDeliveryArea">
                            <SelectTrigger
                              className={cn(
                                "h-12 rounded-2xl border-0 bg-[#f5f5f1] px-5 text-sm",
                                state.errors?.otherDeliveryArea && "border border-destructive",
                              )}
                            >
                              <SelectValue placeholder="Select specific point" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {discounts.find((d) => d.campus === deliveryLocation)?.meetingPoints?.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                              <SelectItem value="Other">Other (Specify below)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FieldError message={state.errors?.otherDeliveryArea?.[0]} />
                        </div>
                      )}

                      <div className="space-y-3">
                         <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowNotes(!showNotes)}
                            className="text-xs text-primary font-bold hover:bg-transparent p-0 h-auto"
                          >
                            {showNotes ? "- Hide Notes" : "+ Add Drop-off Notes"}
                          </Button>
                          
                          {showNotes && (
                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <LabelledInput
                                  id="deliveryAddressNote"
                                  name="deliveryAddressNote"
                                  label="Drop-off Notes"
                                  placeholder="e.g. Call upon arrival..."
                                />
                             </motion.div>
                          )}
                      </div>

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleUseLocation}
                          disabled={locationLoading}
                          className="w-full h-14 rounded-full font-bold text-sm bg-primary/5 text-primary hover:bg-primary/10 border-0"
                        >
                          {locationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <MapPin className="h-4 w-4 mr-2" />
                          )}
                          Auto-detect my campus
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                     <Button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full h-14 rounded-full font-bold text-base shadow-lg"
                      >
                        Continue to Contact <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pt-8 pb-8 space-y-7"
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Contact</h2>
                      <p className="text-[13px] text-muted-foreground mt-1">For your receipt and rider updates.</p>
                    </div>

                    <div className="space-y-4">
                      <LabelledInput
                        id="email"
                        name="email"
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        className={cn(state.errors?.email && "ring-1 ring-destructive")}
                      />
                      <div className="space-y-0.5">
                        <LabelledInput
                          id="phone_masked"
                          name="phone_masked"
                          type="tel"
                          label="Mobile Number"
                          placeholder="+233 xx xxx xxxx"
                          className={cn(state.errors?.phone_masked && "ring-1 ring-destructive")}
                        />
                        <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5 pt-2 ml-1">
                          <Lock className="h-3 w-3" />
                          Masked; riders will only see a proxy number.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/10">
                    <div className="pt-4">
                      <OrderSummaryCard />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                       <Button 
                          type="button" 
                          variant="ghost"
                          onClick={() => setStep(1)}
                          className="h-12 w-12 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground"
                        >
                           <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <SubmitButton disabled={isSubmitDisabled} />
                    </div>
                    
                    <p className="text-center text-[11px] text-muted-foreground leading-relaxed px-4">
                      Payments processed via Paystack. <br />
                      By clicking you agree to our <Link href="/terms" className="underline font-medium hover:text-foreground">Terms</Link>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>
      </div>
    </div>
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
