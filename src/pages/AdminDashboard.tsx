import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Utensils, Ticket, Calendar, BarChart3, RefreshCw } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Footer from "@/components/Footer";

interface Token {
  id: string;
  is_used: boolean;
}

interface MealTypeData {
  meal_type: string;
  count: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [tokenStats, setTokenStats] = useState({ total: 0, used: 0, unused: 0 });
  const [mealTypeData, setMealTypeData] = useState<MealTypeData[]>([]);
  const [menuData, setMenuData] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenCode, setTokenCode] = useState("");
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchTokenStats();
    fetchMealTypeData();
    fetchTodayMenu();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      navigate("/auth");
      return;
    }

    // Get admin's college and name
    const { data: profileData } = await supabase
      .from("profiles")
      .select("college, full_name")
      .eq("id", user.id)
      .single();

    setUserName(profileData?.full_name || "Admin");
    setCollege(profileData?.college || "");
    setLoading(false);
  };

  const fetchTokenStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Tokens are automatically filtered by college through RLS
    const { data: allTokens } = await supabase
      .from("tokens")
      .select("id, is_used")
      .eq("meal_date", today);

    if (allTokens) {
      setTokenStats({
        total: allTokens.length,
        used: allTokens.filter((t) => t.is_used).length,
        unused: allTokens.filter((t) => !t.is_used).length,
      });
    }
  };

  const fetchMealTypeData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Tokens are automatically filtered by college through RLS
    const { data: tokens } = await supabase
      .from("tokens")
      .select("meal_type")
      .eq("meal_date", today);

    if (tokens) {
      // Group by meal_type and count
      const mealCounts: { [key: string]: number } = {};
      tokens.forEach((token) => {
        const mealType = token.meal_type;
        mealCounts[mealType] = (mealCounts[mealType] || 0) + 1;
      });

      const chartData = Object.entries(mealCounts).map(([meal_type, count]) => ({
        meal_type: meal_type.charAt(0).toUpperCase() + meal_type.slice(1),
        count: count as number,
      }));

      setMealTypeData(chartData);
    }
  };

  const fetchTodayMenu = async () => {
    const today = new Date().toISOString().split('T')[0];
    // Menus are automatically filtered by college through RLS
    const { data } = await supabase
      .from("daily_menus")
      .select("*")
      .eq("menu_date", today)
      .maybeSingle();

    if (data) {
      setMenuData({
        breakfast: data.breakfast || "",
        lunch: data.lunch || "",
        snacks: data.snacks || "",
        dinner: data.dinner || "",
      });
    }
  };

  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!college) {
      toast({
        title: "Error",
        description: "College information not found",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from("daily_menus")
        .upsert({
          menu_date: today,
          breakfast: menuData.breakfast,
          lunch: menuData.lunch,
          snacks: menuData.snacks,
          dinner: menuData.dinner,
          created_by: user.id,
          college: college,
        }, {
          onConflict: 'menu_date,college'
        });

      if (error) throw error;

      toast({
        title: "Menu Updated!",
        description: "Today's menu has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTokenStats(), fetchMealTypeData()]);
    setRefreshing(false);
    toast({
      title: "Refreshed!",
      description: "Token statistics have been updated.",
    });
  };

  const handleValidateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token code",
        variant: "destructive",
      });
      return;
    }

    setValidating(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch the token
      const { data: tokenData, error: fetchError } = await supabase
        .from("tokens")
        .select("*")
        .eq("token_code", tokenCode.trim())
        .eq("meal_date", today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!tokenData) {
        toast({
          title: "Invalid Token",
          description: "Token not found or expired",
          variant: "destructive",
        });
        return;
      }

      if (tokenData.is_used) {
        toast({
          title: "Token Already Used",
          description: "This token has already been redeemed",
          variant: "destructive",
        });
        return;
      }

      // Mark token as used
      const { error: updateError } = await supabase
        .from("tokens")
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", tokenData.id);

      if (updateError) throw updateError;

      // Immediately update the stats in state
      setTokenStats(prev => ({
        ...prev,
        used: prev.used + 1,
        unused: prev.unused - 1
      }));

      toast({
        title: "Token Validated!",
        description: `${tokenData.meal_type} meal marked as served`,
      });

      setTokenCode("");
      
      // Refresh data from database to ensure accuracy
      await fetchTokenStats();
      await fetchMealTypeData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidating(false);
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
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Utensils className="h-8 w-8" />
            <h1 className="text-2xl font-bold">MessMate - Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-white text-purple-600 font-semibold">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:block">{userName}</span>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Section */}
        <Card className="mb-8 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Token Analytics</CardTitle>
                  <CardDescription>Today's token generation by meal type</CardDescription>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Bar Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Tokens by Meal Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mealTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meal_type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Tokens Generated" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mealTypeData}
                      dataKey="count"
                      nameKey="meal_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.meal_type}: ${entry.count}`}
                    >
                      {mealTypeData.map((entry, index) => {
                        const colors = [
                          "hsl(var(--primary))",
                          "hsl(var(--secondary))",
                          "hsl(var(--accent))",
                          "hsl(25 95% 65%)"
                        ];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Ticket className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{tokenStats.total}</div>
              <p className="text-xs text-muted-foreground">Generated today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used Tokens</CardTitle>
              <Ticket className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{tokenStats.used}</div>
              <p className="text-xs text-muted-foreground">Meals served</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tokens</CardTitle>
              <Ticket className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{tokenStats.unused}</div>
              <p className="text-xs text-muted-foreground">Yet to be used</p>
            </CardContent>
          </Card>
        </div>

        {/* Token Validation Section */}
        <Card className="mb-8 shadow-xl border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Ticket className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Validate Token</CardTitle>
                <CardDescription>Enter token code to mark meal as served</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidateToken} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter token code (e.g., TKN-123456)"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button type="submit" size="lg" disabled={validating}>
                {validating ? "Validating..." : "Validate Token"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Menu Update Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Update Today's Menu</CardTitle>
                <CardDescription>Enter menu items for each meal (comma-separated)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateMenu} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="breakfast">Breakfast</Label>
                  <Textarea
                    id="breakfast"
                    placeholder="e.g., Idli, Dosa, Coffee, Tea"
                    value={menuData.breakfast}
                    onChange={(e) => setMenuData({ ...menuData, breakfast: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lunch">Lunch</Label>
                  <Textarea
                    id="lunch"
                    placeholder="e.g., Rice, Dal, Sabzi, Roti, Salad"
                    value={menuData.lunch}
                    onChange={(e) => setMenuData({ ...menuData, lunch: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="snacks">Snacks</Label>
                  <Textarea
                    id="snacks"
                    placeholder="e.g., Samosa, Pakora, Tea, Coffee"
                    value={menuData.snacks}
                    onChange={(e) => setMenuData({ ...menuData, snacks: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dinner">Dinner</Label>
                  <Textarea
                    id="dinner"
                    placeholder="e.g., Chapati, Dal, Paneer, Rice"
                    value={menuData.dinner}
                    onChange={(e) => setMenuData({ ...menuData, dinner: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={updating}>
                {updating ? "Updating..." : "Update Menu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
