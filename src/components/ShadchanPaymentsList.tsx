
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, DollarSign, Calendar, MessageSquare, Save, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  amount: number;
  message: string;
  created_at: string;
  confirmation_sent: boolean;
  from_user: string;
  sender_name?: string;
}

interface PaymentDetails {
  id?: string;
  zelle_email?: string;
  zelle_phone?: string;
  preferred_contact?: 'email' | 'phone';
  display_name?: string;
}

const ShadchanPaymentsList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPayments();
      loadPaymentDetails();
    }
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("to_user", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get sender names separately
      const paymentsWithNames = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", payment.from_user)
            .single();

          return {
            ...payment,
            sender_name: profileData?.name || "Unknown User"
          };
        })
      );

      setPayments(paymentsWithNames);
    } catch (error) {
      console.error("Failed to load payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentDetails = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("shadchan_payment_details")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPaymentDetails(data);
      }
    } catch (error) {
      console.error("Failed to load payment details:", error);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      });
    }
  };

  const savePaymentDetails = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        user_id: user.id,
        zelle_email: paymentDetails.zelle_email || null,
        zelle_phone: paymentDetails.zelle_phone || null,
        preferred_contact: paymentDetails.preferred_contact || null,
        display_name: paymentDetails.display_name || null,
        updated_at: new Date().toISOString(),
      };

      if (paymentDetails.id) {
        const { error } = await supabase
          .from("shadchan_payment_details")
          .update(dataToSave)
          .eq("id", paymentDetails.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("shadchan_payment_details")
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setPaymentDetails(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Success",
        description: "Payment details saved successfully",
      });
    } catch (error) {
      console.error("Failed to save payment details:", error);
      toast({
        title: "Error",
        description: "Failed to save payment details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-green-600" />
            <span>Zelle Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={paymentDetails.display_name || ""}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Name to display to parents"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="zelle_email">Zelle Email</Label>
            <Input
              id="zelle_email"
              type="email"
              value={paymentDetails.zelle_email || ""}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, zelle_email: e.target.value }))}
              placeholder="your-email@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="zelle_phone">Zelle Phone</Label>
            <Input
              id="zelle_phone"
              type="tel"
              value={paymentDetails.zelle_phone || ""}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, zelle_phone: e.target.value }))}
              placeholder="(555) 123-4567"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Preferred Contact Method</Label>
            <RadioGroup
              value={paymentDetails.preferred_contact || "email"}
              onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, preferred_contact: value as 'email' | 'phone' }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone">Phone</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={savePaymentDetails}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Payment Details
          </Button>
        </CardContent>
      </Card>

      {/* Payments Received Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Payments Received ({payments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.sender_name}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ${payment.amount?.toFixed(2) || "0.00"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {payment.message || "No message"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.confirmation_sent ? "default" : "secondary"}
                      >
                        {payment.confirmation_sent ? "Confirmed" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No payments received yet
              </h3>
              <p className="text-gray-500">
                Payments from parents will appear here when they send thank you payments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadchanPaymentsList;
