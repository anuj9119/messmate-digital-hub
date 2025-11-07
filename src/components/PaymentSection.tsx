import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, QrCode, Zap, ShieldCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PaymentSection = () => {
  const navigate = useNavigate();

  const handleGenerateToken = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
            For Day Scholars
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Generate Secure Tokens
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tap generate token, get your digital token instantly, and skip the queue!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Payment Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-accent to-accent/70 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Pay for Your Meal</CardTitle>
              <CardDescription>Select meal type and pay securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <MealOption name="Breakfast" price="₹40" />
                <MealOption name="Lunch" price="₹60" />
                <MealOption name="Snacks" price="₹30" />
                <MealOption name="Dinner" price="₹60" />
              </div>
              <Button className="w-full" size="lg" onClick={handleGenerateToken}>
                <Smartphone className="mr-2 h-5 w-5" />
                Generate Token
              </Button>
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  Secure
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Instant
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Display Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Get Your Token</CardTitle>
              <CardDescription>Show this at the counter to collect food</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 text-center border-2 border-dashed border-primary/30">
                <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-md">
                  <QrCode className="h-32 w-32 text-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-primary">TOKEN #A247</p>
                  <Badge variant="secondary" className="text-sm">
                    Lunch - Paid
                  </Badge>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                    <Clock className="h-4 w-4" />
                    Valid till 2:30 PM
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Payment successful! Show this token to collect your meal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard 
              step="1"
              title="Select & Pay"
              description="Choose your meal and pay online securely"
            />
            <StepCard 
              step="2"
              title="Get Token"
              description="Receive digital token instantly on screen"
            />
            <StepCard 
              step="3"
              title="Collect Food"
              description="Show token and collect your meal directly"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const MealOption = ({ name, price }: { name: string; price: string }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
      <span className="font-medium text-foreground">{name}</span>
      <span className="font-bold text-primary">{price}</span>
    </div>
  );
};

const StepCard = ({ step, title, description }: { step: string; title: string; description: string }) => {
  return (
    <div className="text-center">
      <div className="mx-auto bg-gradient-to-br from-primary to-secondary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
        {step}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default PaymentSection;
