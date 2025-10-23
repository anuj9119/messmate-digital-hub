import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, UtensilsCrossed, Calendar, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MenuSection from "@/components/MenuSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Generate your meal tokens and view today's menu</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Token Generation Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                Generate Meal Token
              </CardTitle>
              <CardDescription>Select your meal and generate a token (No payment required for testing)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Meal Type</label>
                <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a meal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateToken} 
                disabled={isGenerating || !selectedMeal}
                className="w-full"
                variant="hero"
              >
                {isGenerating ? "Generating..." : "Generate Token (Free)"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Payment integration will be added later
              </p>
            </CardContent>
          </Card>

          {/* Current Token Display */}
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Your Active Token
              </CardTitle>
              <CardDescription>Today's meal token</CardDescription>
            </CardHeader>
            <CardContent>
              {currentToken ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg text-center">
                    <div className="text-6xl font-mono font-bold text-primary mb-2">
                      {currentToken.token_code}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <UtensilsCrossed className="h-4 w-4" />
                      <span className="capitalize">{currentToken.meal_type}</span>
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>{new Date(currentToken.meal_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      currentToken.is_used 
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300" 
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    }`}>
                      {currentToken.is_used ? "Used" : "Valid"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active token for today</p>
                  <p className="text-sm">Generate one to access your meals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Menu */}
        <MenuSection />
      </main>
    </div>
  );
};

export default StudentDashboard;