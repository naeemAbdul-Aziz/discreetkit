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
    <div className="space-y-1.5 w-full">
      <Label
        htmlFor={id}
        className="text-[13px] font-medium text-muted-foreground ml-0.5"
      >
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className={cn(
          "h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-colors focus-visible:bg-transparent focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-[15px]",
          props.className,
        )}
      />
    </div>
  );
}
a;
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
    isStudent,
  } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold tracking-tight mb-5">Summary</h3>
      {isStudent && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-success mb-5">
          <GraduationCap className="h-4 w-4" />
          <p className="text-[13px] font-medium">
            Free student delivery applied
          </p>
        </div>
      )}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-lg bg-background border border-border/40 overflow-hidden flex-shrink-0 shadow-sm">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-medium text-[14px] leading-tight text-foreground">
                  {item.name}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Qty {item.quantity}
                </p>
              </div>
            </div>
            <p className="font-medium text-[14px] pt-1">
              GHS {(item.price_ghs * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      <div className="space-y-2.5 text-[14px]">
        <div className="flex justify-between text-muted-foreground">
          <p>Subtotal</p>
          <p className="text-foreground font-medium">
            GHS {subtotal.toFixed(2)}
          </p>
        </div>
        {studentDiscount > 0 && (
          <div className="flex justify-between text-success">
            <p>Student Discount</p>
            <p className="font-medium">- GHS {studentDiscount.toFixed(2)}</p>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <p>Delivery Fee</p>
          <p className="text-foreground font-medium">
            GHS {deliveryFee.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex items-baseline justify-between font-bold text-lg">
        <p>Total</p>
        <p className="text-primary">GHS {totalPrice.toFixed(2)}</p>
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
    <div className="max-w-[460px] mx-auto w-full mt-2 lg:mt-8 px-4 sm:px-0">
      <form
        ref={formRef}
        action={dispatch}
        className="space-y-8 pb-12 relative"
      >
        <FormPendingOverlay />
        <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
        <input type="hidden" name="subtotal" value={subtotal} />
        <input type="hidden" name="studentDiscount" value={studentDiscount} />
        <input type="hidden" name="deliveryFee" value={deliveryFee} />
        <input type="hidden" name="totalPrice" value={totalPrice} />

        {/* Section 1: Delivery Details */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Delivery Details
            </h2>
            <p className="text-[14px] text-muted-foreground mt-1">
              Where should we drop this off?
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 w-full">
              <Label className="text-[13px] font-medium text-muted-foreground ml-0.5">
                Delivery Region
              </Label>
              <Select
                name="deliveryArea"
                onValueChange={handleLocationChange}
                value={deliveryLocation || "Other"}
                disabled={!isMounted}
              >
                <SelectTrigger
                  className={cn(
                    "h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-colors focus:bg-transparent shadow-sm text-[15px]",
                    state.errors?.deliveryArea && "border-destructive",
                  )}
                >
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Other">Standard Delivery</SelectItem>
                  {discounts.map((d) => (
                    <SelectItem key={d.id} value={d.campus}>
                      {d.campus}
                    </SelectItem>
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
                className={cn(
                  state.errors?.otherDeliveryArea && "border-destructive",
                )}
              />
            ) : (
              <div className="space-y-1.5 w-full">
                <Label className="text-[13px] font-medium text-muted-foreground ml-0.5">
                  Pickup Point
                </Label>
                <Select name="otherDeliveryArea">
                  <SelectTrigger
                    className={cn(
                      "h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-colors focus:bg-transparent shadow-sm text-[15px]",
                      state.errors?.otherDeliveryArea && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder="Select specific point" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {discounts
                      .find((d) => d.campus === deliveryLocation)
                      ?.meetingPoints?.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    <SelectItem value="Other">
                      Other (Specify in notes)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={state.errors?.otherDeliveryArea?.[0]} />
              </div>
            )}

            <LabelledInput
              id="deliveryAddressNote"
              name="deliveryAddressNote"
              label="Drop-off Notes (Optional)"
              placeholder="e.g. Call upon arrival..."
            />

            <div className="pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={handleUseLocation}
                disabled={locationLoading}
                className="h-9 px-3 rounded-lg text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors -ml-3"
              >
                {locationLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                ) : (
                  <MapPin className="h-3 w-3 mr-1.5" />
                )}
                Auto-detect my campus
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Section 2: Contact Info */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
            <p className="text-[14px] text-muted-foreground mt-1">
              For your receipt and rider updates.
            </p>
          </div>

          <div className="space-y-4">
            <LabelledInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              className={cn(state.errors?.email && "border-destructive")}
            />
            <div className="space-y-0.5">
              <LabelledInput
                id="phone_masked"
                name="phone_masked"
                type="tel"
                label="Mobile Number"
                placeholder="+233 xx xxx xxxx"
                className={cn(
                  state.errors?.phone_masked && "border-destructive",
                )}
              />
              <p className="text-[12px] text-muted-foreground/80 flex items-center gap-1.5 pt-1.5 ml-0.5">
                <Lock className="h-3 w-3" />
                Masked; riders will only see a proxy number.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary Flat Box */}
        <div className="bg-muted/30 border border-border/40 rounded-[2rem] p-6 sm:p-7 mt-8">
          <OrderSummaryCard />
        </div>

        {/* Action Area */}
        <div className="pt-2">
          <SubmitButton disabled={isSubmitDisabled} />
          <p className="text-center text-[12px] text-muted-foreground mt-4 px-4 leading-relaxed">
            Payments processed securely via Paystack. <br />
            By placing your order you agree to our{" "}
            <Link
              href="/terms"
              className="underline hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </form>
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
