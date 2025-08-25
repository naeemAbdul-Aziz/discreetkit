
export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
      <div className="prose prose-lg mx-auto">
        <h1 className="font-headline text-4xl font-bold">Terms of Service</h1>
        <p className="lead">
          Welcome to AnonTest Ghana. By using our website and services, you agree to these terms. Please read them carefully.
        </p>
        
        <h2 className="font-headline text-2xl font-bold mt-8">1. About Our Service</h2>
        <p>
          AnonTest Ghana provides a platform for ordering self-test medical kits for private, informational use. Our service is designed to be anonymous and discreet. The tests provided are for screening purposes only and do not constitute a medical diagnosis.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">2. User Responsibility</h2>
        <ul>
          <li>You are responsible for following the instructions provided with each test kit accurately.</li>
          <li>You understand that a self-test result is preliminary. For a diagnosis, you must consult a qualified healthcare professional. We provide a list of trusted partners for confidential follow-up.</li>
          <li>You are responsible for the safekeeping of your unique, anonymous order code.</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold mt-8">3. Orders and Payment</h2>
        <p>
          All payments are processed securely through our third-party payment provider, Paystack. By placing an order, you agree to their terms of service. We do not store your financial information. An order is confirmed only after successful payment.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">4. Delivery and Refunds</h2>
        <p>
          We will make every effort to deliver your order within the estimated timeframe. However, we are not liable for delays outside of our control.
        </p>
        <p>
          Due to the nature of the products, all sales are final. We cannot accept returns or issue refunds unless the product arrives damaged or defective. If you receive a damaged item, contact us within 24 hours with your order code to arrange a replacement.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">5. Limitation of Liability</h2>
        <p>
          AnonTest Ghana is a platform for distributing test kits. We are not a healthcare provider. We are not liable for any actions you take or do not take based on the results of a self-test. Our liability is limited to the purchase price of the product.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">6. Prohibited Use</h2>
        <p>
          You agree not to use our service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">7. Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Your continued use of the service after any changes constitutes your acceptance of the new terms.
        </p>

        <p className="mt-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
