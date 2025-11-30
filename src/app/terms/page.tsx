import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Terms of Service',
  description: 'DiscreetKit Ghana terms of service. Understand our policies for confidential health product delivery, returns, and customer responsibilities.',
  url: '/terms'
});

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Terms of Service', url: '/terms' }
];

export default function TermsPage() {
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
          <span>Terms of Service</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Last updated: November 30, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p>
              By accessing and using DiscreetKit Ghana's website and services, you agree to be bound 
              by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">About Our Service</h2>
            <p>
              DiscreetKit Ghana provides confidential delivery of health products including self-test kits, 
              wellness products, and health-related items. Our service is designed to maintain your privacy 
              and ensure discreet delivery.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Age Requirements</h2>
            <ul className="list-disc pl-6">
              <li>You must be at least 18 years old to use our services</li>
              <li>Some products may have additional age restrictions</li>
              <li>By ordering, you confirm you meet all age requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Product Information & Availability</h2>
            <ul className="list-disc pl-6">
              <li>Product descriptions and images are for information purposes</li>
              <li>We strive for accuracy but cannot guarantee perfection</li>
              <li>Product availability is subject to stock levels</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to limit quantities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Ordering & Payment</h2>
            
            <h3 className="text-xl font-medium mb-2">Order Process</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Orders are subject to acceptance and availability</li>
              <li>We may refuse or cancel orders at our discretion</li>
              <li>Order confirmation does not guarantee product availability</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">Payment Terms</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Payment is required before order processing</li>
              <li>We accept mobile money, bank transfers, and cash on delivery</li>
              <li>All prices include applicable taxes</li>
              <li>Payment information is processed securely</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Delivery & Shipping</h2>
            <ul className="list-disc pl-6">
              <li>Delivery is available in Accra, Kumasi, and University of Ghana</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>All packages are delivered discreetly with no identifying marks</li>
              <li>Someone must be available to receive the delivery</li>
              <li>Delivery fees apply based on location</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Returns & Refunds</h2>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-amber-800">
                Important: Due to health and safety regulations, most health products cannot be returned once delivered.
              </p>
            </div>

            <h3 className="text-xl font-medium mb-2">Return Policy</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Returns are only accepted for damaged or defective products</li>
              <li>Returns must be reported within 24 hours of delivery</li>
              <li>Original packaging and condition must be maintained</li>
              <li>Prescription products cannot be returned</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">Refund Process</h3>
            <ul className="list-disc pl-6">
              <li>Approved refunds will be processed within 5-7 business days</li>
              <li>Refunds will be issued to the original payment method</li>
              <li>Delivery fees are non-refundable unless product is defective</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <ul className="list-disc pl-6">
              <li>Provide accurate delivery and contact information</li>
              <li>Use products according to instructions and recommendations</li>
              <li>Ensure someone is available for delivery</li>
              <li>Report any issues promptly</li>
              <li>Respect the confidentiality of other customers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6">
              <li>Use our services for any unlawful purpose</li>
              <li>Attempt to interfere with our website or services</li>
              <li>Share account credentials with others</li>
              <li>Resell products purchased from us</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Privacy & Confidentiality</h2>
            <p>
              We maintain strict confidentiality regarding all orders and customer information. 
              Please refer to our Privacy Policy for detailed information about how we handle 
              your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p>
              DiscreetKit Ghana's liability is limited to the cost of the products purchased. 
              We are not responsible for any indirect, incidental, or consequential damages 
              arising from the use of our products or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded">
              <p>Email: support@discreetkit.com</p>
              <p>Phone: +233 20 300 1107</p>
              <p>Hours: Monday-Friday 9AM-6PM (GMT)</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will 
              be effective immediately upon posting. Your continued use of our services constitutes 
              acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of Ghana. Any disputes will be 
              resolved in the appropriate courts of Ghana.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}