import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { LogOut, QrCode, Clock, Utensils, XCircle } from "lucide-react";
import MenuSection from "@/components/MenuSection";
import PaymentSection from "@/components/PaymentSection";
import Footer from "@/components/Footer";

interface Token {
  id: string;
  token_code: string;
  meal_type: string;
  is_used: boolean;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [collegeName, setCollegeName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [mealPreferences, setMealPreferences] = useState({
    skip_breakfast: false,
    skip_lunch: false,
    skip_snacks: false,
    skip_dinner: false,
  });
  const [updatingPreferences, setUpdatingPreferences] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is a student
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role === "admin") {
      navigate("/admin");
      return;
    }

    // Get user's name and college
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, college_name")
      .eq("id", user.id)
      .single();

    setUser(user);
    setUserName(profileData?.full_name || "User");
    const userCollege = profileData?.college_name || "default";
    setCollegeName(userCollege);
    fetchLatestToken(user.id);
    fetchMealPreferences(user.id);
    setLoading(false);
  };

  const fetchMealPreferences = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("meal_preferences")
      .select("skip_breakfast, skip_lunch, skip_snacks, skip_dinner")
      .eq("user_id", userId)
      .eq("meal_date", today)
      .maybeSingle();
    
    if (data) {
      setMealPreferences(data);
    }
  };

  const handleUpdateMealPreferences = async (mealType: string, checked: boolean) => {
    if (!user) return;

    setUpdatingPreferences(true);
    
    const today = new Date().toISOString().split('T')[0];
    const fieldName = `skip_${mealType.toLowerCase()}`;
    const newPreferences = { ...mealPreferences, [fieldName]: checked };
    
    try {
      // Check if preference exists
      const { data: existing } = await supabase
        .from("meal_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("meal_date", today)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("meal_preferences")
          .update(newPreferences)
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new with college_name
        const { error } = await supabase
          .from("meal_preferences")
          .insert({
            user_id: user.id,
            meal_date: today,
            college_name: collegeName,
            ...newPreferences,
          });
        
        if (error) throw error;
      }

      setMealPreferences(newPreferences);
      toast({
        title: "Updated!",
        description: `${mealType} preference updated successfully.`,
      });
    } catch (error: any) {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPreferences(false);
    }
  };

  const fetchLatestToken = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("tokens" as any)
      .select("id, token_code, meal_type, is_used, created_at")
      .eq("user_id", userId)
      .eq("meal_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) setCurrentToken(data as unknown as Token);
  };

  const handleGenerateToken = async () => {
    if (!selectedMeal) {
      toast({
        title: "Error",
        description: "Please select a meal first",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingToken(true);

    try {
      const tokenCode = `TKN-${Date.now().toString().slice(-6)}`;
      const today = new Date().toISOString().split('T')[0];

      // Check if token already exists for this meal today
      const { data: existingToken } = await supabase
        .from("tokens")
        .select("id, token_code")
        .eq("user_id", user.id)
        .eq("meal_type", selectedMeal)
        .eq("meal_date", today)
        .maybeSingle();

      if (existingToken) {
        toast({
          title: "Token Already Exists",
          description: `You already have a token for ${selectedMeal} today: ${existingToken.token_code}`,
          variant: "destructive",
        });
        setGeneratingToken(false);
        return;
      }

      const { data, error } = await supabase
        .from("tokens")
        .insert({
          user_id: user.id,
          meal_type: selectedMeal,
          meal_date: today,
          token_code: tokenCode,
          qr_code_data: tokenCode,
          is_used: false,
          college_name: collegeName,
        })
        .select("id, token_code, meal_type, is_used, created_at")
        .single();

      if (error) {
        console.error("Token generation error:", error);
        throw error;
      }

      setCurrentToken(data as unknown as Token);
      toast({
        title: "Token Generated!",
        description: `Your token for ${selectedMeal} is ready: ${data.token_code}`,
      });
    } catch (error: any) {
      console.error("Token generation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Utensils className="h-8 w-8" />
            <h1 className="text-2xl font-bold">MessMate - Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-white text-primary font-semibold">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <div className="font-medium">{userName}</div>
                {collegeName && (
                  <div className="text-xs text-white/80">{collegeName}</div>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Meal Opt-out Section */}
      <section className="py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-orange-200 dark:border-orange-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-orange-600" />
                  <div>
                    <CardTitle className="text-xl">Skip Today's Meals</CardTitle>
                    <CardDescription>
                      Let us know if you won't be eating today to help reduce food wastage
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Breakfast", key: "skip_breakfast" },
                    { name: "Lunch", key: "skip_lunch" },
                    { name: "Snacks", key: "skip_snacks" },
                    { name: "Dinner", key: "skip_dinner" }
                  ].map((meal) => (
                    <div key={meal.name} className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={meal.key}
                        checked={mealPreferences[meal.key as keyof typeof mealPreferences]}
                        onCheckedChange={(checked) => 
                          handleUpdateMealPreferences(meal.name, checked as boolean)
                        }
                        disabled={updatingPreferences}
                      />
                      <label
                        htmlFor={meal.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {meal.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Token Generation Section */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Generate Your Meal Token</h2>
              <p className="text-muted-foreground">Select a meal to generate your token</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Meal Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Meal</CardTitle>
                  <CardDescription>Choose your meal and generate token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { name: "Breakfast", price: "₹40" },
                      { name: "Lunch", price: "₹60" },
                      { name: "Snacks", price: "₹30" },
                      { name: "Dinner", price: "₹60" }
                    ].map((meal) => (
                      <Button
                        key={meal.name}
                        variant={selectedMeal === meal.name ? "default" : "outline"}
                        className="w-full justify-between h-auto py-4"
                        onClick={() => setSelectedMeal(meal.name)}
                        disabled={generatingToken}
                      >
                        <span className="font-medium">{meal.name}</span>
                        <span className="font-bold">{meal.price}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleGenerateToken}
                    disabled={!selectedMeal || generatingToken}
                  >
                    {generatingToken ? "Generating..." : "Generate Token"}
                  </Button>
                </CardContent>
              </Card>

              {/* Token Display */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Your Token</CardTitle>
                  <CardDescription>Show this at the counter</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentToken ? (
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 text-center border-2 border-dashed border-primary/30">
                      <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-md">
                        <QrCode className="h-32 w-32 text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-primary">{currentToken.token_code}</p>
                        <Badge variant="secondary" className="text-sm">
                          {currentToken.meal_type} - {currentToken.is_used ? "Used" : "Valid"}
                        </Badge>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                          <Clock className="h-4 w-4" />
                          Generated: {new Date(currentToken.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No token generated yet.</p>
                      <p className="text-sm">Select a meal to generate your token.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <MenuSection />
      <Footer />
    </div>
  );
};

export default Dashboard;
