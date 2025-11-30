import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'DiscreetKit Ghana privacy policy. Learn how we protect your personal information and maintain confidentiality in all our health product deliveries.',
  url: '/privacy'
});

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Privacy Policy', url: '/privacy' }
];

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">Home</a>
          <span className="mx-2">/</span>
          <span>Privacy Policy</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Last updated: November 30, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to Privacy</h2>
            <p>
              At DiscreetKit Ghana, we understand that privacy is paramount when it comes to health products. 
              This Privacy Policy explains how we collect, use, and protect your personal information when you 
              use our website and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-2">Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact information (email, phone number)</li>
              <li>Delivery address and preferences</li>
              <li>Order history and product preferences</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Website usage data and analytics</li>
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and communication</li>
              <li>Improving our website and services</li>
              <li>Sending important updates about your orders</li>
              <li>Ensuring the security and safety of our platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Protection & Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>SSL encryption for all data transmission</li>
              <li>Secure payment processing through certified providers</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Anonymous order tracking systems</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6">
              <li>With delivery partners to fulfill orders (address only)</li>
              <li>With payment processors to complete transactions</li>
              <li>With pharmacy partners for order fulfillment</li>
              <li>When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <ul className="list-disc pl-6">
              <li>Access your personal data we hold</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies Policy</h2>
            <p>
              We use cookies to enhance your browsing experience and provide personalized content. 
              You can manage cookie preferences through your browser settings. Essential cookies 
              required for website functionality cannot be disabled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or want to exercise your rights, 
              contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p>Email: privacy@discreetkit.com</p>
              <p>Phone: +233 20 300 1107</p>
              <p>Address: Accra, Ghana</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on 
              this page with an updated revision date. Continued use of our services after changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}