/**
 * @file page.tsx
 * @description the privacy policy page for discreetkit.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how DiscreetKit Ghana handles your data with respect to your privacy and anonymity.',
};

export default function PrivacyPolicyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </CardHeader>
      <CardContent className="space-y-6 text-muted-foreground">
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">1. Our Commitment to Anonymity</h2>
            <p>
                DiscreetKit Ghana ("we," "us," "our") is fundamentally designed around user anonymity. Our primary mission is to provide you with access to health products without compromising your privacy. We do not require user accounts, names, or email addresses for standard orders.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
            <p>
                To fulfill your order, we collect the minimum necessary information:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Delivery Location:</strong> Your selected delivery area or campus, and any specific notes you provide for the delivery agent.</li>
                <li><strong>Contact Number:</strong> A phone number is required solely for the delivery rider to coordinate the drop-off. This number is masked and is only visible to the rider during the delivery process.</li>
                <li><strong>Payment Information:</strong> We use Paystack, a secure third-party payment processor, to handle all transactions. We do not see or store your Mobile Money (MoMo) number or card details. We only receive a confirmation of payment from Paystack.</li>
                <li><strong>Email Address:</strong> An email is required by Paystack to send you a payment receipt. We do not store this email or use it for marketing purposes.</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">3. Data Deletion Policy</h2>
            <p>
                We are committed to data minimization. All personal information associated with your delivery (phone number and delivery location) is permanently and automatically deleted from our systems 7 days after your order is marked as "Completed".
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">4. Use of Cookies and Tracking</h2>
            <p>
                We use cookies for essential site functionality, such as keeping items in your shopping cart. We do not use third-party tracking cookies for advertising. Our AI Chatbot, Pacely, uses session-based memory to understand the flow of your conversation but does not store personal data or link conversations to orders.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">5. Data Sharing</h2>
            <p>
                We do not sell, trade, or rent your information to third parties. The only parties who receive any of your information are:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>The Delivery Rider:</strong> Receives your masked phone number and delivery location for the sole purpose of delivering your order.</li>
                <li><strong>Paystack:</strong> Our payment processor, which handles your payment details according to its own strict privacy policy.</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">6. Security</h2>
            <p>
                We implement a variety of security measures to maintain the safety of your information. All backend logic is handled through secure Next.js Server Actions, meaning your data does not get directly exposed to the browser. Our database is secured with Supabase's Row Level Security (RLS) policies.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">7. Changes to This Policy</h2>
            <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">8. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, you can contact us at support@discreetkit.com.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
