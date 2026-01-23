"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createRefillSubscription } from "@/lib/actions";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function EnrollmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName") || "Medication Refill";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    frequency: "monthly",
    address: "",
    phone: "",
    doctor: "",
    city: "Accra",
  });

  const [successCode, setSuccessCode] = useState<string | null>(null);

  if (!productId) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p>Please select a medication from the catalog first.</p>
        <Button
          className="mt-4"
          onClick={() => router.push("/products/medication-refills")}
        >
          Go to Catalog
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Construct address JSON
    const fullAddress = JSON.stringify({
      street: formData.address,
      city: formData.city,
      phone: formData.phone,
    });

    const payload = new FormData();
    payload.append("productId", productId);
    payload.append("frequency", formData.frequency);
    payload.append("deliveryAddress", fullAddress);
    if (formData.doctor) payload.append("doctor", formData.doctor);

    const result = await createRefillSubscription(null, payload);

    setIsSubmitting(false);

    if (result.success) {
      setSuccessCode(result.code);
      setStep(3); // Success step
    } else {
      toast({
        title: "Enrollment Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  if (successCode) {
    return (
      <div className="container max-w-md py-20 text-center">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/20 p-4 rounded-full w-fit mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-300">
              Enrollment Complete!
            </CardTitle>
            <CardDescription>
              You have successfully subscribed to {productName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-lg border text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Your Anonymous DK Code
              </p>
              <p className="text-3xl font-mono font-bold tracking-wider">
                {successCode}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this code at our partner pharmacies to pick up your refills
              anonymously if you choose pickup.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/refills/dashboard")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Refill Enrollment
          </h1>
          <p className="text-muted-foreground">
            Set up your automated refill schedule for{" "}
            <strong>{productName}</strong>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Delivery Schedule" : "Delivery Details"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Choose how often you need this medication."
                : "Where should we send your refills?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4">
                <div
                  onClick={() =>
                    setFormData({ ...formData, frequency: "monthly" })
                  }
                  className={`flex items-center space-x-4 rounded-xl border p-4 transition-all cursor-pointer ${formData.frequency === "monthly" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${formData.frequency === "monthly" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {formData.frequency === "monthly" && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-lg">
                      Monthly Refill
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Best for daily medications (PrEP, ARVs). Delivered every
                      30 days.
                    </span>
                  </div>
                </div>
                <div
                  onClick={() =>
                    setFormData({ ...formData, frequency: "quarterly" })
                  }
                  className={`flex items-center space-x-4 rounded-xl border p-4 transition-all cursor-pointer ${formData.frequency === "quarterly" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${formData.frequency === "quarterly" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {formData.frequency === "quarterly" && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-lg">
                      Quarterly Refill
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Received 3 months supply at once. Delivered every 90 days.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">
                    Delivery Address / Pickup Location
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter street address or 'Pickup at Pharmacy'"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="05XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2 pt-4">
                  <Label htmlFor="doctor">Prescribing Doctor (Optional)</Label>
                  <Input
                    id="doctor"
                    placeholder="Dr. Name / Hospital"
                    value={formData.doctor}
                    onChange={(e) =>
                      setFormData({ ...formData, doctor: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps us verify your prescription faster if needed.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 1 ? (
              <Button variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}

            {step === 1 ? (
              <Button onClick={() => setStep(2)}>Continue to Details</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.address || !formData.phone}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Enrollment
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
