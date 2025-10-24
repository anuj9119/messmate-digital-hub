import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Utensils, Ticket, Calendar } from "lucide-react";
import Footer from "@/components/Footer";

type Token = Tables<"tokens">;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tokenStats, setTokenStats] = useState({ total: 0, used: 0, unused: 0 });
  const [menuData, setMenuData] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchTokenStats();
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
      .from("tokens")
      .select("id, is_used")
      .eq("meal_date", today)
      .returns<Pick<Token, 'id' | 'is_used'>[]>();

    if (allTokens) {
      setTokenStats({
        total: allTokens.length,
        used: allTokens.filter(t => t.is_used).length,
        unused: allTokens.filter(t => !t.is_used).length,
      });
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
