"use client";

import { useState, useEffect } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Truck, Phone, Power } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

interface Rider {
  id: number;
  pharmacy_id: number;
  name: string;
  phone: string;
  is_active: boolean;
  total_deliveries: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRider, setNewRider] = useState({ name: "", phone: "" });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchRiders = useCallback(
    async (pharmId: number) => {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase
          .from("pharmacy_riders")
          .select("*")
          .eq("pharmacy_id", pharmId)
          .order("is_active", { ascending: false })
          .order("name");

        if (error) {
          console.error("Fetch riders error:", error);
          toast({
            title: "Error",
            description: `Failed to load riders: ${error.message}`,
            variant: "destructive",
          });
          return;
        }

        setRiders(data || []);
      } catch (error: any) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    async function init() {
      const supabase = getSupabaseClient();
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User error:", userError);
          toast({
            title: "Authentication Error",
            description: "Please log in to continue",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get pharmacy for this user
        const { data: pharmacy, error: pharmacyError } = await supabase
          .from("pharmacies")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (pharmacyError || !pharmacy) {
          console.error("Pharmacy error:", pharmacyError);
          toast({
            title: "Error",
            description: "No pharmacy found for your account",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setPharmacyId(pharmacy.id);
        await fetchRiders(pharmacy.id);
      } catch (error: any) {
        console.error("Init error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to initialize",
          variant: "destructive",
        });
        setLoading(false);
      }
    }
    init();
  }, [fetchRiders, toast]);

  async function handleAddRider(e: React.FormEvent) {
    e.preventDefault();
    if (!pharmacyId) {
      toast({
        title: "Error",
        description: "Pharmacy ID not found",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from("pharmacy_riders")
        .insert({
          pharmacy_id: pharmacyId,
          name: newRider.name,
          phone: newRider.phone,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Add rider error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Rider added successfully" });
        setIsAddOpen(false);
        setNewRider({ name: "", phone: "" });
        await fetchRiders(pharmacyId);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add rider",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to remove this rider?")) return;
    if (!pharmacyId) return;

    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase
        .from("pharmacy_riders")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Deleted", description: "Rider removed successfully" });
        await fetchRiders(pharmacyId);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete rider",
        variant: "destructive",
      });
    }
  }

  async function handleToggleStatus(id: number, currentStatus: boolean) {
    if (!pharmacyId) return;

    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase
        .from("pharmacy_riders")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) {
        console.error("Toggle status error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Updated",
          description: `Rider ${!currentStatus ? "activated" : "deactivated"}`,
        });
        await fetchRiders(pharmacyId);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update rider status",
        variant: "destructive",
      });
    }
  }

  if (loading) return <div className="p-8">Loading riders...</div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rider Management</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Rider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Rider</DialogTitle>
                <DialogDescription>
                  Add a rider to your fleet registry. Use this for quick
                  assignment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRider} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Rider Name / Service</Label>
                  <Input
                    placeholder="e.g. Kojo or Bolt (Kojo)"
                    value={newRider.name}
                    onChange={(e) =>
                      setNewRider({ ...newRider, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    placeholder="024..."
                    value={newRider.phone}
                    onChange={(e) =>
                      setNewRider({ ...newRider, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    Add Rider
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Riders</CardTitle>
          <CardDescription>
            Manage the riders available for order assignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No riders added yet. Click &quot;Add Rider&quot; to start.
                  </TableCell>
                </TableRow>
              ) : (
                riders.map((rider) => (
                  <TableRow key={rider.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {rider.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {rider.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rider.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {rider.is_active ? "Active" : "Inactive"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleToggleStatus(rider.id, rider.is_active)
                        }
                      >
                        <Power
                          className={`h-4 w-4 ${rider.is_active ? "text-green-600" : "text-gray-400"}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rider.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
