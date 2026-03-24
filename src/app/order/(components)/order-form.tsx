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

function LabelledInput({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, id: string }) {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id} className="text-sm font-medium ml-1">
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className={cn(
          "h-14 rounded-2xl border-border/60 bg-transparent px-4 py-2 transition-all hover:border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
          props.className
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
      className="w-full h-14 rounded-2xl text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] font-semibold"
      disabled={disabled}
      loading={pending}
    >
      {pending ? (
        "Securing Order..."
      ) : (
        <>
          Proceed to Checkout
          <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
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
      <div className="max-w-2xl mx-auto w-full mt-4 lg:mt-12 px-2 sm:px-0">
        <form ref={formRef} action={dispatch} className="bg-card border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2.5rem] p-6 sm:p-10 space-y-8 relative overflow-hidden">
          <FormPendingOverlay />
          <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
          <input type="hidden" name="subtotal" value={subtotal} />
          <input type="hidden" name="studentDiscount" value={studentDiscount} />
          <input type="hidden" name="deliveryFee" value={deliveryFee} />
          <input type="hidden" name="totalPrice" value={totalPrice} />

          {/* Clean Progress Bar matching screenshot */}
          <div className="space-y-3">
            <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider ml-1">
              Step {step}/2
            </span>
            <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out" 
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                 key="step1"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
                 className="space-y-8"
              >
                <div className="px-1">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Where to?</h2>
                  <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                    Tell us what kind of location you're targeting so we can coordinate your discreet drop-off.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Pills instead of large Select dropdowns! */}
                  <div className="space-y-3">
                    <Label className="text-[15px] font-medium ml-1">Delivery type:</Label>
                    <div className="flex flex-wrap gap-2.5">
                      {discounts.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleLocationChange(loc.campus)}
                          className={cn(
                            "px-5 py-3 flex items-center gap-2.5 outline-none rounded-full border transition-all duration-200",
                            deliveryLocation === loc.campus 
                              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20" 
                              : "border-border hover:border-primary/50 text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {deliveryLocation === loc.campus && (
                            <div className="h-4 w-4 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" stroke="currentColor">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                          <span className="font-medium text-[15px]">{loc.campus}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleLocationChange("Other")}
                        className={cn(
                          "px-5 py-3 flex items-center gap-2.5 outline-none rounded-full border transition-all duration-200",
                          showOther 
                            ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20" 
                            : "border-border hover:border-primary/50 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {showOther && (
                          <div className="h-4 w-4 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" stroke="currentColor">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                        <span className="font-medium text-[15px]">Standard Delivery</span>
                      </button>
                    </div>
                  </div>

                  <input type="hidden" name="deliveryArea" value={deliveryLocation || "Other"} />

                  <div className="space-y-4 pt-2">
                    {showOther ? (
                      <div className="space-y-1.5">
                        <LabelledInput
                          id="otherDeliveryArea"
                          name="otherDeliveryArea"
                          label="Your exact address:"
                          placeholder="e.g. Accra Mall, Spintex Road"
                          className={cn(state.errors?.otherDeliveryArea && "border-destructive")}
                        />
                        <FieldError message={state.errors?.otherDeliveryArea?.[0]} />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="space-y-2 w-full">
                          <Label className="text-sm font-medium ml-1">Specific pickup area:</Label>
                          <Select name="otherDeliveryArea">
                            <SelectTrigger
                              className={cn(
                                "h-14 rounded-2xl border-border/60 bg-transparent px-4 transition-all hover:border-border",
                                state.errors?.otherDeliveryArea && "border-destructive focus:ring-destructive"
                              )}
                            >
                              <SelectValue placeholder="e.g. Jubilee Hall entrance..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {discounts
                                .find((d) => d.campus === deliveryLocation)
                                ?.meetingPoints?.map((point) => (
                                  <SelectItem key={point} value={point} className="py-2.5">
                                    {point}
                                  </SelectItem>
                                ))}
                              <SelectItem value="Other" className="py-2.5">Other (Specify below)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FieldError message={state.errors?.otherDeliveryArea?.[0]} />
                      </div>
                    )}

                    <div className="pt-2">
                      {!showNotes ? (
                        <button 
                          type="button"
                          onClick={() => setShowNotes(true)} 
                          className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 outline-none rounded-lg p-1"
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                          Add drop-off note
                        </button>
                      ) : (
                        <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                          <LabelledInput
                            id="deliveryAddressNote"
                            name="deliveryAddressNote"
                            label="Drop-off instructions:"
                            placeholder="e.g. Call upon arrival, leave at main gate..."
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleUseLocation}
                        disabled={locationLoading}
                        className="h-14 rounded-2xl px-5 text-[15px] font-medium hover:bg-muted text-muted-foreground hidden sm:flex"
                      >
                        {locationLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                        Locate me
                      </Button>
                      <Button 
                        type="button"
                        className="h-14 w-full sm:w-36 rounded-2xl text-[15px] bg-primary hover:bg-primary/90 text-primary-foreground transition-all ml-auto font-semibold"
                        onClick={() => setStep(2)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                 key="step2"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
                 className="space-y-8"
              >
                <div className="px-1">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Secure Contact</h2>
                  <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                    How should the assigned dispatch rider reach you?
                  </p>
                </div>

                <div className="space-y-5">
                   <div className="space-y-1.5">
                      <LabelledInput
                        id="email"
                        name="email"
                        type="email"
                        label="Receipt Email:"
                        placeholder="you@example.com"
                        className={cn(state.errors?.email && "border-destructive")}
                      />
                      <FieldError message={state.errors?.email?.[0]} />
                   </div>
                   
                   <div className="space-y-1.5">
                      <LabelledInput
                        id="phone_masked"
                        name="phone_masked"
                        type="tel"
                        label="Your Mobile Number:"
                        placeholder="+233 xx xxx xxxx"
                        className={cn(state.errors?.phone_masked && "border-destructive")}
                      />
                      <FieldError message={state.errors?.phone_masked?.[0]} />
                      <p className="text-[13px] text-muted-foreground/80 flex items-center gap-1.5 mt-2 ml-1">
                        <Lock className="h-3 w-3" />
                        Permanently masked for your privacy.
                      </p>
                   </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-lg font-bold px-1 mb-4 hidden">Order Details</h3>
                  <div className="rounded-3xl border border-border/60 bg-muted/20 overflow-hidden">
                     <OrderSummaryCard />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)} 
                    className="h-14 px-6 sm:px-8 rounded-2xl text-[15px] font-medium border-border/80 hover:bg-muted text-foreground transition-all shrink-0"
                  >
                    Back
                  </Button>
                  <SubmitButton disabled={isSubmitDisabled} />
                </div>
                
                <p className="text-center text-[12px] text-muted-foreground leading-relaxed px-4 pt-2">
                  Secured via Paystack. By proceeding, you agree to our <Link href="/terms" className="underline hover:text-foreground transition-colors" target="_blank">Terms</Link>.
                </p>
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
