import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      navigate("/dashboard");
      return;
    }

    setLoading(false);
  };

  const fetchTokenStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: allTokens } = await supabase
      .from("tokens" as any)
      .select("id, is_used")
      .eq("meal_date", today);

    if (allTokens) {
      const tokens = allTokens as unknown as Token[];
      setTokenStats({
        total: tokens.length,
        used: tokens.filter((t) => t.is_used).length,
        unused: tokens.filter((t) => !t.is_used).length,
      });
    }
  };

  const fetchMealTypeData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: tokens } = await supabase
      .from("tokens" as any)
      .select("meal_type")
      .eq("meal_date", today);

    if (tokens) {
      // Group by meal_type and count
      const mealCounts: { [key: string]: number } = {};
      tokens.forEach((token: any) => {
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
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from("daily_menus")
        .upsert({
          menu_date: today,
          breakfast: menuData.breakfast,
          lunch: menuData.lunch,
          snacks: menuData.snacks,
          dinner: menuData.dinner,
          created_by: user?.id,
        }, {
          onConflict: 'menu_date'
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
          <Button variant="secondary" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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
