import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getUserRefillSubscriptions, getUserRefillLogs } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { AlertCircle, Clock, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RefillsDashboard() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect_to=/refills/dashboard");
  }

  const subscriptions = await getUserRefillSubscriptions();

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Refills</h1>
            <p className="text-muted-foreground mt-1">
              Manage your medication subscriptions and history.
            </p>
          </div>
          <Button asChild>
            <Link href="/products/medication-refills">Browse Medications</Link>
          </Button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
            <div className="mx-auto bg-muted p-4 rounded-full w-fit mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No Active Subscriptions
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              You haven't enrolled in any refill programs yet. Subscribe to your
              essential medications for automated delivery.
            </p>
            <Button asChild>
              <Link href="/products/medication-refills">
                Start a Subscription
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {subscriptions.map((sub: any) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function SubscriptionCard({ subscription }: { subscription: any }) {
  // Fetch logs for this specific subscription
  const logs = await getUserRefillLogs(subscription.id);
  const nextDelivery = subscription.next_delivery_date
    ? new Date(subscription.next_delivery_date)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Mock next date if null

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-[300px_1fr] h-full">
        <div className="bg-muted/30 p-6 flex flex-col justify-between border-r-0 md:border-r border-b md:border-b-0">
          <div>
            <div className="flex items-start justify-between mb-4">
              <Badge
                variant={
                  subscription.status === "active" ? "default" : "secondary"
                }
              >
                {subscription.status.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded border">
                {subscription.subscription_code || "NO-CODE"}
              </span>
            </div>
            <h3 className="tex-xl font-bold mb-1">
              {subscription.product_name}
            </h3>
            <p className="text-sm font-medium text-muted-foreground mb-4">
              {subscription.frequency === "monthly"
                ? "Monthly Refill"
                : "Quarterly Refill"}
            </p>

            {subscription.image_url && (
              <div className="relative h-40 w-full rounded-md overflow-hidden bg-background border mb-4">
                <Image
                  src={subscription.image_url}
                  alt={subscription.product_name}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold">
                GHS {subscription.price_ghs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Delivery:</span>
              <span className="font-semibold text-primary">
                {format(nextDelivery, "MMM do, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-0">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-6 pt-6 mb-2">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">Refill History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-background p-6 pt-2">
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <h4 className="font-semibold">Prescription Status</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subscription.prescription_verified
                        ? "Verified & Active. No action needed."
                        : "Verification Pending. Our pharmacist will review your file soon."}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <h4 className="font-semibold">Delivery Address</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {subscription.delivery_address?.street},{" "}
                      {subscription.delivery_address?.city}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-sm">
                    No refill history yet. Your first delivery is scheduled
                    soon.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="p-3 font-medium">Date</th>
                          <th className="p-3 font-medium">Status</th>
                          <th className="p-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {logs.map((log: any) => (
                          <tr key={log.id}>
                            <td className="p-3">
                              {format(new Date(log.filled_at), "MMM do, yyyy")}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="capitalize">
                                {log.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {log.pharmacist_notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="space-y-4 max-w-md">
                  <p className="text-sm text-muted-foreground">
                    Need to pause your subscription or change delivery details?
                    Please contact support currently to make changes.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                  <Button
                    variant="destructive"
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Card>
  );
}
