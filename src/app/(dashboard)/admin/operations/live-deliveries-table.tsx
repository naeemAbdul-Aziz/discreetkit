"use client";

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
import { formatDistanceToNow } from "date-fns";
import { MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function LiveDeliveriesTable({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No active orders right now.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Time Elapsed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pharmacy</TableHead>
            <TableHead>Rider</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={order.isStuck ? "bg-red-50" : ""}
            >
              <TableCell>
                <div className="font-medium">{order.code}</div>
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> {order.delivery_area}
                </div>
              </TableCell>
              <TableCell>
                <div className={order.isStuck ? "text-red-600 font-bold" : ""}>
                  {order.minutesElapsed} mins
                </div>
                <div className="text-xs text-muted-foreground">
                  since{" "}
                  {new Date(order.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "out_for_delivery"
                      ? "default"
                      : order.status === "processing"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {order.status.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>{order.pharmacyName}</TableCell>
              <TableCell>
                {order.courier_name ? (
                  <div>
                    <div className="font-medium">{order.courier_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Phone className="h-3 w-3 mr-1" /> {order.courier_phone}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/orders?search=${order.code}`}>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
