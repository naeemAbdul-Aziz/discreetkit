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
        <CardTitle className="text-3xl font-headline">Terms of Service — Access DiscreetKit Ltd</CardTitle>
        <p className="text-muted-foreground">Effective Date: November 2025</p>
        <p className="text-muted-foreground">Last Updated: November 2025</p>
      </CardHeader>
      <CardContent className="space-y-6 text-muted-foreground">
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
                By accessing or using the Access DiscreetKit website or services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you should not use our platform.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">2. Service Description</h2>
            <p>
                Access DiscreetKit is an online facilitation service that connects users to verified partner pharmacies, hospitals, and delivery services for the purchase and delivery of self-test kits and related health products.
            </p>
            <p>
                We do not manufacture or sell these products directly. All products are provided and dispatched by our authorized partners.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">3. Eligibility</h2>
            <p>
                To use our platform, you must:
            </p>
             <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Be at least 18 years old, or have parental consent if younger;</li>
                <li>Provide accurate and truthful information during ordering;</li>
                <li>Agree to use our services responsibly and lawfully.</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">4. Ordering and Payment</h2>
             <ul className="list-disc list-inside space-y-1 pl-4">
                <li>You agree to pay all applicable fees for products or services you request.</li>
                <li>Orders are only processed after full payment confirmation.</li>
                <li>Payment is processed securely through authorized payment gateways (e.g., Paystack, Flutterwave).</li>
                <li>Orders are non-refundable once dispatched, except for defective or incorrect items.</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">5. Delivery and Pickup</h2>
            <p>
                Deliveries are handled by our courier or partner pharmacies. Orders are shipped in unbranded, discreet packaging. Estimated delivery times are indicated at checkout but may vary.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">6. Privacy and Data Protection</h2>
            <p>
                Your use of our services is subject to our Privacy Policy, which outlines how we collect and protect your information. We take confidentiality seriously and comply with Ghana’s Data Protection Act (Act 843).
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
                Access DiscreetKit Ltd is not liable for:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Any misuse of the products after delivery;</li>
                <li>Delays caused by third-party delivery services or partners;</li>
                <li>Inaccurate information provided by the user;</li>
                <li>Any indirect, incidental, or consequential damages arising from the use of our platform.</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">8. Medical Disclaimer</h2>
            <p>
                Access DiscreetKit Ltd is not a medical service provider. We provide access to self-test kits and connect users to licensed healthcare professionals when needed. Always consult a qualified medical professional for medical advice or follow-up care.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">9. Intellectual Property</h2>
            <p>
                All content on our website — logos, text, graphics, and software — is owned by Access DiscreetKit Ltd. You may not reproduce or use it without our written consent.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">10. Suspension or Termination</h2>
            <p>
                We may suspend or terminate user access if:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Fraudulent, abusive, or illegal activity is detected;</li>
                <li>There is a breach of these Terms.</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">11. Governing Law</h2>
            <p>
                These Terms are governed by the laws of the Republic of Ghana. Any disputes will be resolved under the jurisdiction of Ghanaian courts.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">12. Contact Information</h2>
             <address className="not-italic">
                Access DiscreetKit Ltd<br />
                House No. 57, Kofi Annan East Avenue, Madina, Accra – Ghana<br />
                Email: <a href="mailto:support@discreetkit.com" className="text-primary hover:underline">support@discreetkit.com</a><br />
                Phone: <a href="tel:+233203001107" className="text-primary hover:underline">+233 20 300 1107</a>
            </address>
        </div>
      </CardContent>
    </Card>
  );
}
