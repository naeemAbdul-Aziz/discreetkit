"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, CalendarClock, Phone, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { logRefill } from "@/lib/pharmacy-actions";
import { Label } from "@/components/ui/label";
import { dashboardTable, pharmacyRefillsCols, actions as actionStyles } from "@/components/ui/table-layout";

export function PharmacyRefillsTable({
  initialSubscriptions,
}: {
  initialSubscriptions: any[];
}) {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const handleLogRefill = async () => {
    if (!loggingId) return;

    const result = await logRefill(loggingId, notes);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Refill Logged",
        description: "Inventory updated and next delivery scheduled.",
      });
      setLoggingId(null);
      setNotes("");
      window.location.reload();
    }
  };

  return (
    <div className={dashboardTable.container}>
      <Table className={dashboardTable.table}>
        <TableHeader>
          <TableRow>
            <TableHead className={pharmacyRefillsCols.patientHead}>Patient / Contact</TableHead>
            <TableHead className={pharmacyRefillsCols.productHead}>Product</TableHead>
            <TableHead className={pharmacyRefillsCols.nextDueHead}>Next Due</TableHead>
            <TableHead className={pharmacyRefillsCols.statusHead}>Status</TableHead>
            <TableHead className={pharmacyRefillsCols.actionsHead}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No active subscriptions assigned.
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((sub) => {
              const address = sub.delivery_address || {};
              const contactName = address.fullName || sub.user_name || "Anonymous";
              const contactDetail = address.phone || sub.user_email || sub.subscription_code;

              return (
                <TableRow key={sub.id}>
                  <TableCell className={pharmacyRefillsCols.patientCell}>
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-2 truncate">
                        <User className="h-3 w-3 text-muted-foreground" /> {contactName}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                        <Phone className="h-3 w-3" /> {contactDetail}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono mt-1">
                        {sub.subscription_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={pharmacyRefillsCols.productCell}>
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{sub.product_name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {sub.frequency} Refill
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={pharmacyRefillsCols.nextDueCell}>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarClock className="h-4 w-4 text-orange-500" />
                      {sub.next_delivery_date
                        ? new Date(sub.next_delivery_date).toLocaleDateString()
                        : "Pending"}
                    </div>
                  </TableCell>
                  <TableCell className={pharmacyRefillsCols.statusCell}>
                    <Badge variant={sub.status === "active" ? "default" : "secondary"}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell className={pharmacyRefillsCols.actionsCell}>
                    <Button
                      size="sm"
                      className={`gap-2 ${actionStyles.actionButton}`}
                      onClick={() => setLoggingId(sub.id)}
                      disabled={sub.status !== "active"}
                      title="Log Refill"
                    >
                      <Pill className="h-4 w-4" />
                      <span className="truncate">Log Refill</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog open={!!loggingId} onOpenChange={(o) => !o && setLoggingId(null)} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Medication Refill</DialogTitle>
            <DialogDescription>
              Confirm that you are dispensing this refill. This will update
              inventory and schedule the next due date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Pharmacist Notes (Optional)</Label>
              <Textarea
                placeholder="e.g. Patient counselling provided. Brand changed to X."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLoggingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleLogRefill}>Confirm Refill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
