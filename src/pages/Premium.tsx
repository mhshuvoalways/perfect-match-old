import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Crown, Heart, LogOut, Star, User, Zap } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { usePremium } from "@/hooks/usePremium";

const Premium = () => {
  const navigate = useNavigate();
  const { profile, signOut, user } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isPremium, isLoading: premiumLoading, checkPremiumStatus } = usePremium();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log("Session ID found:", sessionId);
    
    if (sessionId) {
      // Verify the payment and update premium access
      const verifyPayment = async () => {
        try {
          console.log("Calling verify-premium-payment with session_id:", sessionId);
          const { data, error } = await supabase.functions.invoke('verify-premium-payment', {
            body: { session_id: sessionId }
          });
          
          if (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Verification Error",
              description: "Payment successful but verification failed. Please contact support.",
              variant: "destructive",
            });
            return;
          }

          console.log("Payment verification response:", data);

          if (data?.success && data?.payment_status === 'paid') {
            toast({
              title: "Payment Successful!",
              description: "Your premium access has been activated.",
            });
            // Refresh premium status
            checkPremiumStatus();
            // Remove session_id from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('session_id');
            window.history.replaceState({}, '', newUrl.toString());
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast({
            title: "Verification Error",
            description: "Payment successful but verification failed. Please contact support.",
            variant: "destructive",
          });
        }
      };
      
      verifyPayment();
    }
  }, [searchParams, toast, checkPremiumStatus]);

  const premiumFeatures = [
    {
      icon: Zap,
      title: "AI Compatibility Checker",
      description:
        "Compare two profiles and get detailed compatibility insights",
      badge: "Most Popular",
    },
    {
      icon: Star,
      title: "Smart Questions Generator",
      description: "Get personalized questions for calls and meetings",
      badge: "New",
    },
    {
      icon: Calendar,
      title: "Voice-to-AI Date Reports",
      description: "Record feedback and get AI-generated summaries",
      badge: "",
    },
    {
      icon: User,
      title: "Expert Shadchan Access",
      description: "Book consultations with senior matchmakers",
      badge: "Exclusive",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePremiumPurchase = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user already has premium
    if (isPremium) {
      toast({
        title: "Already Premium!",
        description: "You have already purchased premium access. Enjoy all the features!",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-premium-payment');
      
      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Error",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error", 
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">ShadchanApp</h1>
              <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                Premium
              </Badge>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        profile.role === "parent" ? "/parent" : "/shadchan"
                      )
                    }
                  >
                    Dashboard
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Premium <span className="text-amber-600">AI Tools</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Take your shidduch process to the next level with advanced AI
            capabilities and access to expert shadchanim.
          </p>
          
          {isPremium ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-green-100 text-green-800 px-6 py-2 text-lg">
                ✓ Premium Active - Enjoy all features!
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                onClick={handlePremiumPurchase}
                disabled={isLoading || premiumLoading}
              >
                {isLoading ? "Processing..." : "Upgrade to Premium - $29"}
              </Button>
            </div>
          )}
        </div>

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {premiumFeatures.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  {feature.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePremiumPurchase}
                  disabled={isLoading || premiumLoading || isPremium}
                >
                  {isPremium ? "Already Purchased" : isLoading ? "Processing..." : "Try Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Section - Only show if not premium */}
        {!isPremium && (
          <div className="bg-white rounded-2xl border shadow-lg p-8 mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h3>
              <p className="text-gray-600">
                Choose the plan that works best for your family or shadchan
                practice.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Plan */}
              <Card className="border-2">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Basic</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-4">
                    Free
                  </div>
                  <CardDescription>Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      Resume builder
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      Basic notes
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      Match tracking
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline">
                    Get Started
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-amber-200 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-4">
                    $29<span className="text-lg text-gray-600"> one-time</span>
                  </div>
                  <CardDescription>
                    Everything you need for successful matching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      All Basic features
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      AI compatibility checker
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      Smart questions generator
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      Voice-to-AI reports
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-2" />
                      Advanced organizer tools
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-6 bg-amber-600 hover:bg-amber-700"
                    onClick={handlePremiumPurchase}
                    disabled={isLoading || premiumLoading}
                  >
                    {isLoading ? "Processing..." : "Upgrade to Premium - $29"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CTA Section - Only show if not premium */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Shidduch Process?
            </h3>
            <p className="text-xl mb-6 text-amber-100">
              Join hundreds of families and shadchanim who are already using our
              AI-powered platform.
            </p>
            <Button
              size="lg"
              className="bg-white text-amber-600 hover:bg-gray-100"
              onClick={handlePremiumPurchase}
              disabled={isLoading || premiumLoading}
            >
              {isLoading ? "Processing..." : "Upgrade to Premium - $29"}
            </Button>
          </div>
        )}

        {/* Thank you message for premium users */}
        {isPremium && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl text-white p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Thank You for Being Premium!
            </h3>
            <p className="text-xl mb-6 text-green-100">
              You now have access to all our advanced AI tools and features. 
              Head to your dashboard to start exploring!
            </p>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => navigate(profile.role === "parent" ? "/parent" : "/shadchan")}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;
