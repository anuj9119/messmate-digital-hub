import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Bell, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

const AdminSection = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [snacks, setSnacks] = useState("");
  const [dinner, setDinner] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTodayMenu();
  }, [menuDate]);

  const fetchTodayMenu = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("menu_date", menuDate)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBreakfast(data.breakfast || "");
        setLunch(data.lunch || "");
        setSnacks(data.snacks || "");
        setDinner(data.dinner || "");
      } else {
        setBreakfast("");
        setLunch("");
        setSnacks("");
        setDinner("");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const handleSaveMenu = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("daily_menus")
        .upsert({
          menu_date: menuDate,
          breakfast,
          lunch,
          snacks,
          dinner,
        }, {
          onConflict: 'menu_date'
        });

      if (error) throw error;

      toast({
        title: "Menu updated!",
        description: "The daily menu has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save menu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (roleLoading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
            Admin Dashboard
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Manage Your Mess Efficiently
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Update menus, track payments, and notify students - all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <AdminCard 
            icon={<Bell className="h-8 w-8" />}
            title="Send Notifications"
            description="Alert students about menu updates"
            color="from-accent to-blue-600"
          />
          <AdminCard 
            icon={<Calendar className="h-8 w-8" />}
            title="Weekly Planning"
            description="Plan and schedule menus in advance"
            color="from-secondary to-green-600"
          />
          <AdminCard 
            icon={<Users className="h-8 w-8" />}
            title="View Analytics"
            description="Track meals served and payments"
            color="from-purple-500 to-pink-600"
          />
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Update Daily Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu-date">Date</Label>
                <Input
                  id="menu-date"
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breakfast">Breakfast</Label>
                  <Input
                    id="breakfast"
                    placeholder="e.g., Idli, Sambar, Tea"
                    value={breakfast}
                    onChange={(e) => setBreakfast(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch">Lunch</Label>
                  <Input
                    id="lunch"
                    placeholder="e.g., Rice, Dal, Sabzi"
                    value={lunch}
                    onChange={(e) => setLunch(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snacks">Snacks</Label>
                  <Input
                    id="snacks"
                    placeholder="e.g., Samosa, Tea"
                    value={snacks}
                    onChange={(e) => setSnacks(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinner">Dinner</Label>
                  <Input
                    id="dinner"
                    placeholder="e.g., Roti, Dal, Sabzi"
                    value={dinner}
                    onChange={(e) => setDinner(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveMenu} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {isLoading ? "Saving..." : "Save Menu"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const AdminCard = ({ icon, title, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <CardContent className="pt-6">
        <div className={`bg-gradient-to-br ${color} text-white w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default AdminSection;
