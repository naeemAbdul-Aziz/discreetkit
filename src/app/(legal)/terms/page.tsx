
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
   const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-24">
         <Card className="p-4 md:p-8 shadow-sm">
          <CardHeader className="text-center px-0">
            <CardTitle className="font-headline text-4xl font-bold">Terms of Service</CardTitle>
            <CardDescription className="text-lg">
                Welcome to DiscreetKit. By using our website and services, you agree to these terms.
            </CardDescription>
             <p className="text-sm text-muted-foreground pt-2">Last Updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-8">
              
              <Card>
                <CardHeader>
                  <CardTitle>1. About Our Service</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                    DiscreetKit provides a platform for ordering health products, including self-test kits, for private, informational use. Our service is designed to be anonymous and discreet. The tests provided are for screening purposes only and do not constitute a medical diagnosis.
                    </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. User Responsibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                    <li>You are responsible for following the instructions provided with each product accurately.</li>
                    <li>You understand that a self-test result is preliminary. For a diagnosis, you must consult a qualified healthcare professional. We provide a list of trusted partners for confidential follow-up.</li>
                    <li>You are responsible for the safekeeping of your unique, anonymous order code.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Orders and Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All payments are processed securely through our third-party payment provider, Paystack. By placing an order, you agree to their terms of service. We do not store your financial information. An order is confirmed only after successful payment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Delivery and Refunds</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                    We will make every effort to deliver your order within the estimated timeframe. However, we are not liable for delays outside of our control. Due to the medical and personal nature of the products, all sales are final. We cannot accept returns or issue refunds unless the product arrives damaged or defective. If you receive a damaged item, contact us within 24 hours with your order code to arrange a replacement.
                    </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    DiscreetKit is a platform for distributing health products. We are not a healthcare provider. We are not liable for any actions you take or do not take based on the results of a self-test. Our liability is limited to the purchase price of the product.
                   </p>
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle>6. Prohibited Use</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    You agree not to use our service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.
                   </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    We reserve the right to update these terms at any time. Your continued use of the service after any changes constitutes your acceptance of the new terms.
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
