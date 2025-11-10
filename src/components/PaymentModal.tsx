
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shadchanName: string;
  shadchanId: string;
}

interface ShadchanPaymentDetails {
  zelle_email?: string;
  zelle_phone?: string;
  preferred_contact?: 'email' | 'phone';
  display_name?: string;
}

const PaymentModal = ({ isOpen, onClose, shadchanName, shadchanId }: PaymentModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<ShadchanPaymentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const predefinedAmounts = [18, 36, 100];

  useEffect(() => {
    if (isOpen && shadchanId) {
      loadShadchanPaymentDetails();
    }
  }, [isOpen, shadchanId]);

  const loadShadchanPaymentDetails = async () => {
    if (!shadchanId || shadchanId.trim() === "") return;

    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from("shadchan_payment_details")
        .select("*")
        .eq("user_id", shadchanId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPaymentDetails(data);
    } catch (error) {
      console.error("Failed to load shadchan payment details:", error);
      // Don't show error toast for missing details, just use defaults
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleSendPayment = async () => {
    if (!user) return;

    const finalAmount = selectedAmount || parseFloat(customAmount);
    if (!finalAmount || finalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Check if we have a valid shadchanId
    if (!shadchanId || shadchanId.trim() === "") {
      toast({
        title: "Error",
        description: "Unable to process payment - missing shadchan information",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("payments")
        .insert({
          from_user: user.id,
          to_user: shadchanId,
          amount: finalAmount,
          message: message || `Thank you for the match suggestion!`,
          confirmation_sent: false
        });

      if (error) throw error;

      toast({
        title: "Payment Details Saved",
        description: "Your payment information has been recorded. Please send the payment via Zelle.",
      });

      onClose();
      setSelectedAmount(null);
      setCustomAmount("");
      setMessage("");
    } catch (error) {
      console.error("Failed to save payment:", error);
      toast({
        title: "Error",
        description: "Failed to save payment information",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayContact = () => {
    if (!paymentDetails) return null;
    
    if (paymentDetails.preferred_contact === 'phone' && paymentDetails.zelle_phone) {
      return paymentDetails.zelle_phone;
    } else if (paymentDetails.zelle_email) {
      return paymentDetails.zelle_email;
    } else if (paymentDetails.zelle_phone) {
      return paymentDetails.zelle_phone;
    }
    
    return "Contact information not available";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Thank You Payment to {paymentDetails?.display_name || shadchanName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Select Amount</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amount)}
                  className="h-12"
                >
                  ${amount}
                </Button>
              ))}
              <Button
                variant={customAmount ? "default" : "outline"}
                onClick={() => setSelectedAmount(null)}
                className="h-12"
              >
                Custom
              </Button>
            </div>
          </div>

          {!selectedAmount && (
            <div>
              <Label htmlFor="customAmount">Custom Amount ($)</Label>
              <Input
                id="customAmount"
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Thank you for the match suggestion!"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Zelle Payment Details</h4>
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading payment details...</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-blue-800">
                  <strong>Contact:</strong> {getDisplayContact()}<br />
                  <strong>Name:</strong> {paymentDetails?.display_name || shadchanName}<br />
                  <strong>Amount:</strong> ${selectedAmount || customAmount || "0.00"}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Please send the payment via Zelle using these details
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendPayment}
              disabled={isSubmitting || (!selectedAmount && !customAmount) || !shadchanId || shadchanId.trim() === ""}
              className="flex-1"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
