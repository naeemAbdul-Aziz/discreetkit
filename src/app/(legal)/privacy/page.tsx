
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
      <div className="prose prose-lg mx-auto">
        <h1 className="font-headline text-4xl font-bold">Privacy Policy</h1>
        <p className="lead">
          Your privacy is the foundation of DiscreetKit Ghana. We are committed to ensuring your anonymity and peace of mind. This policy outlines our simple, privacy-first approach.
        </p>
        
        <h2 className="font-headline text-2xl font-bold mt-8">Core Principles</h2>
        <ul>
          <li><strong>No Accounts:</strong> We do not require you to create an account. Your orders are processed anonymously.</li>
          <li><strong>Minimal Data:</strong> We only collect the absolute minimum information required to deliver your order.</li>
          <li><strong>Data Deletion:</strong> Delivery information is purged from our system 7 days after your order is completed.</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold mt-8">What We Collect</h2>
        <p>
          To fulfill your order, we collect:
        </p>
        <ul>
          <li><strong>Selected Product:</strong> The test kit(s) you choose.</li>
          <li><strong>Delivery Information:</strong> The delivery area, campus (if applicable), and any specific notes you provide for the delivery agent.</li>
          <li><strong>Contact Number:</strong> A phone number for the delivery agent to coordinate drop-off. This number is masked in our system and only visible to the assigned agent during delivery.</li>
        </ul>
        <p className="font-bold">
          We explicitly DO NOT collect your name, email address, or any other personal identifiers.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">How We Use Your Information</h2>
        <p>
          The information collected is used solely for the following purposes:
        </p>
        <ul>
          <li>To process your payment through our secure partner, Paystack. We do not see or store your card or mobile money details.</li>
          <li>To dispatch and deliver your order to your specified location.</li>
          <li>To provide you with status updates via your anonymous tracking code.</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold mt-8">Data Security & Deletion</h2>
        <p>
          Your delivery details are stored securely and are only accessible on a need-to-know basis for fulfillment. All delivery-related information (address notes, phone number) is automatically and permanently deleted from our live systems 7 days after the order status is marked as "Completed".
        </p>
        <p>We do not sell, trade, or share your information with any third parties beyond what is necessary for payment processing and delivery.</p>

        <h2 className="font-headline text-2xl font-bold mt-8">Your Tracking Code</h2>
        <p>
          Your unique tracking code is your key. It is generated anonymously and allows you to check your order status without revealing any personal information. Keep it safe.
        </p>

        <h2 className="font-headline text-2xl font-bold mt-8">Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Any changes will be posted on this page. Our core commitment to your privacy will never change.
        </p>
        <p className="mt-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
