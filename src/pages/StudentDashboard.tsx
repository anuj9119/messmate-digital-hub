import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Clock, ShieldCheck, Zap, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import MenuSection from "@/components/MenuSection";
import Footer from "@/components/Footer";

const StudentDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentToken, setCurrentToken] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTodayToken();
    }
  }, [user]);

  const fetchTodayToken = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('user_id', user?.id)
        .eq('meal_date', today)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentToken(data);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const handleGenerateToken = async () => {
    if (!selectedMeal) {
      toast({
        title: "Please select a meal",
        description: "Choose which meal you want to generate a token for",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-token', {
        body: { 
          mealType: selectedMeal,
          mealDate: new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      toast({
        title: "Token Generated!",
        description: "Your meal token has been created successfully.",
      });

      setCurrentToken(data.token);
      setSelectedMeal("");
    } catch (error: any) {
      console.error('Error generating token:', error);
      toast({
        title: "Failed to generate token",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getMealPrice = (mealType: string) => {
    const prices: Record<string, string> = {
      breakfast: "₹40",
      lunch: "₹60",
      snacks: "₹30",
      dinner: "₹60"
    };
    return prices[mealType] || "₹0";
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <MenuSection />
        
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
                For Day Scholars
              </Badge>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Quick & Secure Payments
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Pay online, get your digital token instantly, and skip the queue!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Payment/Token Generation Card */}
              <Card className="shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-gradient-to-br from-accent to-accent/70 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Pay for Your Meal</CardTitle>
                  <CardDescription>Select meal type and get token (Free for now)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast - ₹40</SelectItem>
                      <SelectItem value="lunch">Lunch - ₹60</SelectItem>
                      <SelectItem value="snacks">Snacks - ₹30</SelectItem>
                      <SelectItem value="dinner">Dinner - ₹60</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleGenerateToken} 
                    disabled={isGenerating || !selectedMeal}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? "Generating..." : "Generate Token (Free)"}
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
                  <CardTitle className="text-2xl">Your Token</CardTitle>
                  <CardDescription>Show this at the counter to collect food</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentToken ? (
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 text-center border-2 border-dashed border-primary/30">
                      <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-md">
                        <QrCode className="h-32 w-32 text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-bold text-primary">{currentToken.token_code}</p>
                        <Badge variant="secondary" className="text-sm">
                          <span className="capitalize">{currentToken.meal_type}</span> - {getMealPrice(currentToken.meal_type)}
                        </Badge>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                          <Clock className="h-4 w-4" />
                          Valid for: {new Date(currentToken.meal_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 text-center border-2 border-dashed border-primary/30">
                      <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-md">
                        <QrCode className="h-32 w-32 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Generate a token to see it here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;