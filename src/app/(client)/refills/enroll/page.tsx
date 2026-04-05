"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  createRefillSubscription,
  uploadPrescriptionAction,
} from "@/lib/actions";
import { Loader2, CheckCircle2, Upload, FileText, ChevronLeft, ChevronRight } from "lucide-react";

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
    full_name: "Anonymous User", // Default to anonymous
    address: "",
    phone: "",
    hospitalRefillCode: "",
    doctor: "",
  });
  const [successCode, setSuccessCode] = useState<string | null>(null);

  if (!productId) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mt-2">Please select a medication from the catalog first.</p>
        <Button
          variant="outline"
          className="mt-6 rounded-full px-8"
          onClick={() => router.push("/products/medication-refills")}
        >
          Go to Catalog
        </Button>
      </div>
    );
  }


  const nextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (!formData.phone || !formData.address) {
        toast({
          title: "Missing Info",
          description: "Phone and delivery address are required.",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleSubmit = async () => {
    if (!formData.hospitalRefillCode) {
      toast({ title: "Code Required", description: "Please enter your hospital refill code.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit Enrollment (Code-Based Anonymity Model)
      const payload = new FormData();
      payload.append("productId", productId);
      payload.append("frequency", formData.frequency);
      payload.append("phone", formData.phone);
      payload.append("hospitalRefillCode", formData.hospitalRefillCode);
      payload.append("deliveryAddress", JSON.stringify({
        street: formData.address,
        phone: formData.phone,
        full_name: formData.full_name || "Anonymous User"
      }));
      if (formData.doctor) payload.append("doctor", formData.doctor);

      const result = await createRefillSubscription(null, payload);
      if (result.success) {
        setSuccessCode(result.code);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successCode) {
    return (
      <div className="container max-w-md py-12 px-4 text-center">
        <Card className="border-0 shadow-lg bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6">
            <div className="mx-auto bg-green-50 p-4 rounded-full w-fit mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Enrollment Success!</CardTitle>
            <CardDescription className="px-4">
              Your subscription for {productName} is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            <div className="p-6 bg-[#f5f5f1] rounded-[2rem] border-0 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Your Discreet Code
              </p>
              <p className="text-4xl font-mono font-bold tracking-tight text-primary">
                {successCode}
              </p>
            </div>
            <p className="text-xs text-muted-foreground px-6 leading-relaxed">
              Your refill order has been generated automatically. Reply <b>REFILL</b> to our WhatsApp or use this code to track your delivery.
            </p>
            <div className="flex flex-col gap-3 px-4">
              <Button
                className="w-full h-12 rounded-full font-bold shadow-md"
                onClick={() => router.push(`/track?code=${successCode}`)}
              >
                Track Status
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-full font-bold border-muted"
                onClick={() => window.print()}
              >
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* Header & Stepper */}
        <div className="mb-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  step >= s ? "w-10 bg-primary" : "w-4 bg-muted"
                )}
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Refill Enrollment
          </h1>
          <p className="text-sm text-muted-foreground">
            Automating your refills for <span className="text-foreground font-bold uppercase text-[11px] tracking-wider">{productName}</span>
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 pt-10 px-8">
            <CardTitle className="text-xl font-bold">
              {step === 1 ? "Schedule" : step === 2 ? "Delivery" : "Hospital Auth"}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === 1 ? "Choose your supply cycle." : step === 2 ? "Where should we send it?" : "Enter the code provided by your hospital."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-4">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div
                  onClick={() => setFormData({ ...formData, frequency: "monthly" })}
                  className={cn(
                    "flex items-center space-x-5 rounded-[1.5rem] p-6 transition-all cursor-pointer",
                    formData.frequency === "monthly" ? "bg-primary/5 ring-1 ring-primary" : "bg-[#f5f5f1] hover:bg-muted/40"
                  )}
                >
                  <div className={cn("h-6 w-6 rounded-full border flex items-center justify-center shrink-0", formData.frequency === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/30 bg-white")}>
                    {formData.frequency === "monthly" && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="block font-bold text-base">Monthly Cycle</span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">Delivered every 30 days. Most popular.</span>
                  </div>
                </div>
                <div
                  onClick={() => setFormData({ ...formData, frequency: "quarterly" })}
                  className={cn(
                    "flex items-center space-x-5 rounded-[1.5rem] p-6 transition-all cursor-pointer",
                    formData.frequency === "quarterly" ? "bg-primary/5 ring-1 ring-primary" : "bg-[#f5f5f1] hover:bg-muted/40"
                  )}
                >
                  <div className={cn("h-6 w-6 rounded-full border flex items-center justify-center shrink-0", formData.frequency === "quarterly" ? "border-primary bg-primary" : "border-muted-foreground/30 bg-white")}>
                    {formData.frequency === "quarterly" && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="block font-bold text-base">Quarterly Cycle</span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">3-month supply delivered every 90 days.</span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Recipient Name (Initial only ok)</Label>
                    <Input
                      placeholder="e.g. J. M."
                      className="rounded-2xl h-12 bg-[#f5f5f1] border-0 focus-visible:ring-primary/20 text-sm"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                    <Input
                      placeholder="e.g. 0244000000"
                      className="rounded-2xl h-12 bg-[#f5f5f1] border-0 focus-visible:ring-primary/20 text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Delivery Address</Label>
                  <Input
                    placeholder="Area, Street name, House No."
                    className="rounded-2xl h-12 bg-[#f5f5f1] border-0 focus-visible:ring-primary/20 text-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Prescribing Doctor (Optional)</Label>
                  <Input
                    placeholder="Dr. Smith / Korle Bu"
                    className="rounded-2xl h-12 bg-[#f5f5f1] border-0 focus-visible:ring-primary/20 text-sm"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Hospital Refill Code</Label>
                  <Input
                    placeholder="DK-HOSP-XXXX"
                    className="rounded-2xl h-14 bg-[#f5f5f1] border-2 border-primary/20 focus-visible:ring-primary/20 text-lg font-mono text-center tracking-widest"
                    value={formData.hospitalRefillCode}
                    onChange={(e) => setFormData({ ...formData, hospitalRefillCode: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground px-2 pt-1">
                    Enter the secret code issued by your partner hospital for this program.
                  </p>
                </div>
                <div className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-primary/80 font-medium leading-relaxed">
                        <b>No ID Required.</b> DiscreetKit uses token-based verification. We never store photos of you or your documents.
                      </p>
                    </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between gap-4 p-8 pt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-14 rounded-full font-bold border-muted hover:bg-muted/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="flex-[2] h-14 rounded-full font-bold shadow-lg"
              >
                Continue <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-[2] h-14 rounded-full font-bold shadow-xl transition-all active:scale-95"
                disabled={isSubmitting || !formData.hospitalRefillCode}
              >
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Validating Code...</> : "Verify & Enroll"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
