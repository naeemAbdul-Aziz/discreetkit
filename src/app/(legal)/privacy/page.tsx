
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <Card className="p-4 md:p-8 shadow-lg">
          <CardHeader className="text-center px-0">
            <CardTitle className="font-headline text-4xl font-bold">Privacy Policy</CardTitle>
            <CardDescription className="text-lg">
              Your privacy is the foundation of DiscreetKit. We are committed to ensuring your anonymity.
            </CardDescription>
            <p className="text-sm text-muted-foreground pt-2">Last Updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Core Principles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                    <li>
                      <strong>No Accounts:</strong> We do not require you to create an account. Your orders are
                      processed anonymously.
                    </li>
                    <li>
                      <strong>Minimal Data:</strong> We only collect the absolute minimum information required to deliver
                      your order.
                    </li>
                    <li>
                      <strong>Data Deletion:</strong> Delivery information is purged from our system 7 days after your
                      order is completed.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What We Collect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">To fulfill your order, we collect:</p>
                  <ul className="list-disc space-y-2 pl-5 mt-2 text-muted-foreground">
                    <li>
                      <strong>Selected Product:</strong> The test kit(s) you choose.
                    </li>
                    <li>
                      <strong>Delivery Information:</strong> The delivery area, campus (if applicable), and any specific
                      notes you provide for the delivery agent.
                    </li>
                    <li>
                      <strong>Contact Number:</strong> A phone number for the delivery agent to coordinate drop-off. This
                      number is masked in our system and only visible to the assigned agent during delivery.
                    </li>
                  </ul>
                  <p className="mt-4 font-semibold">
                    We explicitly DO NOT collect your name, email address, or any other personal identifiers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The information collected is used solely for the following purposes:
                  </p>
                  <ul className="list-disc space-y-2 pl-5 mt-2 text-muted-foreground">
                    <li>To process your payment through our secure partner, Paystack. We do not see or store your card or mobile money details.</li>
                    <li>To dispatch and deliver your order to your specified location.</li>
                    <li>To provide you with status updates via your anonymous tracking code.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Security & Deletion</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    Your delivery details are stored securely and are only accessible on a need-to-know basis for fulfillment. All delivery-related information (address notes, phone number) is automatically and permanently deleted from our live systems 7 days after the order status is marked as "Completed". We do not sell, trade, or share your information with any third parties beyond what is necessary for payment processing and delivery.
                   </p>
                </CardContent>
              </Card>

                <Card>
                <CardHeader>
                  <CardTitle>Your Tracking Code</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    Your unique tracking code is your key. It is generated anonymously and allows you to check your order status without revealing any personal information. Please keep it safe.
                   </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    We may update this policy from time to time. Any changes will be posted on this page. Our core commitment to your privacy will never change.
                   </p>
                </CardContent>
              </Card>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
