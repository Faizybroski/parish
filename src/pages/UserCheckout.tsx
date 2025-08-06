import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

function CheckoutForm({
  plan,
  planId,
  userName,
  userEmail,
  clientSecret,
}: {
  plan: any;
  planId: string;
  userName: string;
  userEmail: string;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || loading) return;

    setLoading(true);

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: userName,
          email: userEmail,
        },
      },
    });

    if (result.error) {
      toast({
        title: "Card Error",
        description: result.error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const setupIntent = result.setupIntent;

    const { error: subscriptionError } = await supabase.functions.invoke(
      "create-subscription",
      {
        body: {
          plan_id: planId,
          setup_intent_id: setupIntent.id,
        },
      }
    );

    if (subscriptionError) {
      toast({
        title: "Subscription Failed",
        description: subscriptionError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Your subscription is now active!",
    });

    setLoading(false);
    navigate("/subscription");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10 px-4 max-w-6xl mx-auto"
    >
      <div className="col-span-12 lg:col-span-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <input
                type="text"
                readOnly
                value={userName}
                className="w-full p-2 border rounded bg-muted text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email Address</label>
              <input
                type="email"
                readOnly
                value={userEmail}
                className="w-full p-2 border rounded bg-muted text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-lg font-semibold">{plan.name}</div>
            <div className="text-2xl font-bold">
              ${plan.price} / {plan.interval}
            </div>
            <p className="text-muted-foreground">{plan.description}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Unlimited event creation</li>
              <li>Premium access</li>
              <li>Advanced matching</li>
              <li>Priority support</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-md bg-white">
              <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
            </div>
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={!stripe || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Subscribe Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

export default function UserCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { publishableKey, clientSecret, plan, planId, userName, userEmail } =
    location.state || {};

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!publishableKey || !clientSecret || !plan || !planId || !userEmail) {
      navigate("/subscription");
    } else {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey, clientSecret, plan, planId, userEmail]);

  if (!stripePromise) {
    return <div className="text-center py-20">Loading checkout...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        plan={plan}
        planId={planId}
        userName={userName}
        userEmail={userEmail}
        clientSecret={clientSecret}
      />
    </Elements>
  );
}
