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
import { getSupabaseClient } from "@/lib/supabase";
import { Loader2, CheckCircle2, Upload, FileCheck } from "lucide-react";

export default function EnrollmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName") || "Medication Refill";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    frequency: "monthly",
    address: "",
    phone: "",
    doctor: "",
    city: "Accra",
    prescriptionUrl: "",
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const file = e.target.files[0];

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({ title: "Please login first", variant: "destructive" });
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("prescriptions")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setFormData((prev) => ({ ...prev, prescriptionUrl: data.path }));
      toast({
        title: "Prescription Uploaded",
        description: "File attached successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description:
          error.message ||
          "Could not upload file. Try a different format (JPG/PNG).",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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
    if (formData.prescriptionUrl)
      payload.append("prescriptionUrl", formData.prescriptionUrl);

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
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-6 px-0 sm:px-4">
      <div className="container w-full max-w-2xl mx-auto px-2 sm:px-0">
        <div className="mb-6 text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Refill Enrollment
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Set up your automated refill schedule for{" "}
            <strong>{productName}</strong>.
          </p>
        </div>

        <Card className="border-0 sm:border shadow-sm sm:shadow-md bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
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
                  className={`flex items-center space-x-4 rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-md ${formData.frequency === "monthly" ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.frequency === "monthly" ? "border-primary" : "border-muted-foreground/30"}`}
                  >
                    {formData.frequency === "monthly" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-base sm:text-lg">
                      Monthly Refill
                    </span>
                    <span className="block text-xs sm:text-sm text-muted-foreground mt-1">
                      Best for daily medications (PrEP, ARVs). Delivered every
                      30 days.
                    </span>
                  </div>
                </div>
                <div
                  onClick={() =>
                    setFormData({ ...formData, frequency: "quarterly" })
                  }
                  className={`flex items-center space-x-4 rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-md ${formData.frequency === "quarterly" ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.frequency === "quarterly" ? "border-primary" : "border-muted-foreground/30"}`}
                  >
                    {formData.frequency === "quarterly" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-base sm:text-lg">
                      Quarterly Refill
                    </span>
                    <span className="block text-xs sm:text-sm text-muted-foreground mt-1">
                      Received 3 months supply at once. Delivered every 90 days.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label
                    htmlFor="address"
                    className="text-base font-medium pl-1"
                  >
                    Delivery Address / Pickup Location
                  </Label>
                  <Input
                    id="address"
                    className="h-12 text-base px-4 border-slate-200 focus-visible:ring-primary/20"
                    placeholder="Enter street address or 'Pickup at Pharmacy'"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="city"
                      className="text-base font-medium pl-1"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      className="h-12 text-base px-4 border-slate-200 focus-visible:ring-primary/20"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="phone"
                      className="text-base font-medium pl-1"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      className="h-12 text-base px-4 border-slate-200 focus-visible:ring-primary/20"
                      placeholder="05XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2 border-t pt-6 mt-2">
                  <Label className="text-base font-medium pl-1">
                    Verification Document (Required)
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all relative ${formData.prescriptionUrl ? "border-green-500 bg-green-50/50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="prescription-upload"
                      title="Upload verification document"
                    />
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                      ) : formData.prescriptionUrl ? (
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <FileCheck className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-slate-500" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900 text-sm sm:text-base">
                          {isUploading
                            ? "Uploading document..."
                            : formData.prescriptionUrl
                              ? "Document attached successfully"
                              : "Tap to upload prescription"}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formData.prescriptionUrl
                            ? "Tap again to change"
                            : "Supports: JPG, PNG, PDF (Max 5MB)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 pt-2">
                  <Label htmlFor="doctor" className="pl-1">
                    Prescribing Doctor (Optional)
                  </Label>
                  <Input
                    id="doctor"
                    className="h-11 border-slate-200"
                    placeholder="Dr. Name / Hospital"
                    value={formData.doctor}
                    onChange={(e) =>
                      setFormData({ ...formData, doctor: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground pl-1">
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
                disabled={
                  isSubmitting ||
                  !formData.address ||
                  !formData.phone ||
                  isUploading
                }
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
