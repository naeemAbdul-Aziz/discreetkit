/**
 * @file page.tsx
 * @description the terms of service page for discreetkit.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Read the Terms of Service for using the DiscreetKit Ghana website and services.',
};

export default function TermsOfServicePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </CardHeader>
      <CardContent className="space-y-6 text-muted-foreground">
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
                By accessing and using the DiscreetKit Ghana website (the "Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">2. Service Description</h2>
            <p>
                DiscreetKit provides a platform for the anonymous purchase and discreet delivery of health products, including but not limited to self-test kits and wellness items. The products sold are for informational and personal use only.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">3. Intended Use and Disclaimer</h2>
            <p>
                The self-test kits available on our platform are screening tools and are not a substitute for a professional medical diagnosis. A positive result from any test kit must be confirmed by a licensed medical professional. DiscreetKit is not a healthcare provider and does not offer medical advice.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">4. User Obligations</h2>
            <p>
                You agree to provide accurate information for delivery and payment purposes. You must be of legal age to purchase the products offered on this site. You are responsible for the lawful use of the products purchased.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">5. Payments, Refunds, and Returns</h2>
            <p>
                All payments are processed securely through Paystack. Due to the medical and personal nature of our products, all sales are final. We cannot accept returns or offer refunds. If a product arrives damaged, please contact us with your order code within 48 hours of delivery for a potential replacement.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">6. Anonymity and Data</h2>
            <p>
                We are committed to protecting your anonymity. Please refer to our Privacy Policy for detailed information on how we collect, use, and delete your data.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
                DiscreetKit shall not be liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for health outcomes, emotional distress, or other intangible losses resulting from the use of our service or products.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">8. Changes to Terms</h2>
            <p>
                We reserve the right to modify these terms from time to time at our sole discretion. Your continued use of the Service after any such changes constitutes your acceptance of the new terms.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">9. Contact Information</h2>
            <p>
                For any questions regarding these terms, please contact us at support@discreetkit.com.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
