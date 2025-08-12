import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type WithdrawRequest = {
  id: string;
  creator_id: string;
  note: string;
  total_amount: number;
  status: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

const AdminWalletRequests = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>(
    []
  );
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchWithdrawRequests();
    }
  }, [profile]);

  const fetchWithdrawRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("wallet_withdraw_requests")
        .select(
          `
          id,
          creator_id,
          note,
          total_amount,
          status,
          created_at,
          profiles:creator_id (
            first_name,
            last_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWithdrawRequests(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch wallet withdraw requests.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(id);
    try {
      const { data: wallet, error: walletError } = await supabase
        .from("wallet_withdraw_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (walletError) throw walletError;

      const { error: updateError } = await supabase
        .from("events_payments")
        .update({ withdraw_status: true })
        .eq("creator_id", wallet.creator_id)
        .eq("withdraw_status", false);

      if (updateError) throw updateError;

      const { error: approveError } = await supabase
        .from("wallet_withdraw_requests")
        .update({ status: "approved" })
        .eq("id", id);

      if (approveError) throw approveError;

      toast({
        title: "Success",
        description: "Request approved successfully!",
      });

      fetchWithdrawRequests();
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Wallet Withdraw Requests
      </h1>

      {profile && (
        <Card className="mb-6 shadow-card border-border">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Name:</strong> {profile.first_name} {profile.last_name}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>All Wallet Requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          {withdrawRequests.length === 0 ? (
            <p className="text-muted-foreground">No withdraw requests found.</p>
          ) : (
            <table className="min-w-full text-sm text-left border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 whitespace-nowrap">User</th>
                  <th className="p-3 whitespace-nowrap">Email</th>
                  <th className="p-3 whitespace-nowrap">Note</th>
                  <th className="p-3 whitespace-nowrap">Amount</th>
                  <th className="p-3 whitespace-nowrap">Status</th>
                  <th className="p-3 whitespace-nowrap">Date</th>
                  <th className="p-3 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-t border-border hover:bg-muted/50 transition"
                  >
                    <td className="p-3">
                      {req.profiles?.first_name} {req.profiles?.last_name}
                    </td>
                    <td className="p-3">{req.profiles?.email}</td>
                    <td className="p-3">{req.note}</td>
                    <td className="p-3 text-green-600">${req.total_amount}</td>
                    <td className="p-3 capitalize">{req.status}</td>
                    <td className="p-3">
                      {format(new Date(req.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="p-3">
                      {req.status === "pending" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={loading === req.id}
                          className="flex items-center gap-2"
                        >
                          {loading === req.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} /> Approve
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWalletRequests;
