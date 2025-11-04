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
        <CardTitle className="text-3xl font-headline">Privacy Policy — Access DiscreetKit Ltd</CardTitle>
        <p className="text-muted-foreground">Effective Date: November 2025</p>
        <p className="text-muted-foreground">Last Updated: November 2025</p>
      </CardHeader>
      <CardContent className="space-y-6 text-muted-foreground">
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p>
                Access DiscreetKit Ltd (“DiscreetKit”, “we”, “us”, or “our”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website, platform, and related services.
            </p>
            <p>
                We operate as a digital access platform that connects users to verified pharmacies, laboratories, and healthcare providers for the purchase and delivery of self-test kits and related products.
            </p>
            <p>
                By using our website or services, you consent to the practices described in this Privacy Policy.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
            <p>
                We only collect the minimum information necessary to process your request or order. We may collect:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Contact information (e.g., phone number, email address)</li>
                <li>Delivery details (e.g., address, GPS code, or preferred pickup point)</li>
                <li>Order information (product type, payment reference, and order code)</li>
                <li>Technical data (browser type, device information, and cookies for performance)</li>
            </ul>
            <p className="font-semibold text-foreground mt-2">We do not collect or store:</p>
             <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Medical results or test outcomes</li>
                <li>Sensitive health information beyond what is necessary for delivery or referral</li>
            </ul>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
            <p>
                We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Process and confirm your orders</li>
                <li>Deliver your order discreetly via our partner pharmacies or couriers</li>
                <li>Send SMS/email updates about your order status</li>
                <li>Provide anonymous referral codes for partner hospitals</li>
                <li>Improve our website and service quality</li>
                <li>Comply with Ghanaian laws and data protection regulations</li>
            </ul>
            <p className="mt-2">
                We never sell or rent your data to third parties.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">4. Information Sharing</h2>
            <p>
                We only share your information with:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Partner pharmacies and delivery services for order fulfillment</li>
                <li>Partner hospitals/labs for referrals (using anonymous order codes only)</li>
                <li>SMS/communication providers (like Arkesel) for order updates</li>
                <li>Regulatory authorities if required by law</li>
            </ul>
             <p className="mt-2">
                Each partner operates under a confidentiality and data protection agreement.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">5. Data Retention</h2>
            <p>
                We retain personal data only as long as necessary for:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Completing your order</li>
                <li>Resolving any issues</li>
                <li>Legal or accounting obligations</li>
            </ul>
            <p className="mt-2">
                Afterward, your data is securely deleted or anonymized.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">6. Your Rights</h2>
            <p>
                Under the Ghana Data Protection Act (Act 843), you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Request a copy of your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for communications</li>
            </ul>
             <p className="mt-2">
                To exercise these rights, email us at <a href="mailto:privacy@discreetkit.com" className="text-primary hover:underline">privacy@discreetkit.com</a>.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">7. Cookies and Analytics</h2>
            <p>
                Our website uses basic cookies for functionality and analytics. You can disable cookies in your browser, but some parts of the site may not function properly.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">8. Data Security</h2>
            <p>
                We use secure servers, SSL encryption, and restricted access to protect your data. All communications are transmitted over secure HTTPS protocols. Employees and partners are trained on confidentiality and data handling.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">9. Third-Party Links</h2>
            <p>
                Our website may contain links to partner sites or educational resources. We are not responsible for the privacy practices or content of those sites.
            </p>
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">10. Updates to This Policy</h2>
            <p>
                We may update this Privacy Policy occasionally. The updated version will be posted here with a revised “Last Updated” date.
            </p>
        </div>
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">11. Contact Us</h2>
            <address className="not-italic">
                Access DiscreetKit Ltd<br />
                House No. 57, Kofi Annan East Avenue, Madina, Accra – Ghana<br />
                Email: <a href="mailto:privacy@discreetkit.com" className="text-primary hover:underline">privacy@discreetkit.com</a><br />
                Phone: <a href="tel:+233203001107" className="text-primary hover:underline">+233 20 300 1107</a>
            </address>
        </div>
      </CardContent>
    </Card>
  );
}
