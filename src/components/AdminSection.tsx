import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Bell, Save, Plus, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { Textarea } from "@/components/ui/textarea";

const AdminSection = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState({
    breakfast: [] as string[],
    lunch: [] as string[],
    snacks: [] as string[],
    dinner: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ type: keyof typeof meals; index: number } | null>(null);
  const [newItem, setNewItem] = useState("");

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
        setMeals({
          breakfast: data.breakfast ? data.breakfast.split(',').map((s: string) => s.trim()) : [],
          lunch: data.lunch ? data.lunch.split(',').map((s: string) => s.trim()) : [],
          snacks: data.snacks ? data.snacks.split(',').map((s: string) => s.trim()) : [],
          dinner: data.dinner ? data.dinner.split(',').map((s: string) => s.trim()) : []
        });
      } else {
        setMeals({
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: []
        });
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const addItem = (mealType: keyof typeof meals) => {
    if (newItem.trim()) {
      setMeals(prev => ({
        ...prev,
        [mealType]: [...prev[mealType], newItem.trim()]
      }));
      setNewItem("");
    }
  };

  const removeItem = (mealType: keyof typeof meals, index: number) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (mealType: keyof typeof meals, index: number, value: string) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSaveMenu = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("daily_menus")
        .upsert({
          menu_date: menuDate,
          breakfast: meals.breakfast.join(', '),
          lunch: meals.lunch.join(', '),
          snacks: meals.snacks.join(', '),
          dinner: meals.dinner.join(', '),
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

  const MealEditor = ({ mealType, title }: { mealType: keyof typeof meals; title: string }) => (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
          <Badge variant="secondary">{meals[mealType].length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals[mealType].map((item, index) => (
          <div key={index} className="flex items-center gap-2 group">
            {editingMeal?.type === mealType && editingMeal?.index === index ? (
              <Input
                value={item}
                onChange={(e) => updateItem(mealType, index, e.target.value)}
                onBlur={() => setEditingMeal(null)}
                onKeyPress={(e) => e.key === 'Enter' && setEditingMeal(null)}
                autoFocus
                className="flex-1"
              />
            ) : (
              <div className="flex-1 px-3 py-2 bg-muted rounded-md">{item}</div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingMeal({ type: mealType, index })}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(mealType, index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Input
            placeholder={`Add ${title.toLowerCase()} item...`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem(mealType)}
          />
          <Button onClick={() => addItem(mealType)} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            🔐 Admin Dashboard
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

        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="shadow-xl border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                📅 Menu Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="menu-date">Select Date</Label>
                <Input
                  id="menu-date"
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <MealEditor mealType="breakfast" title="🌅 Breakfast" />
                <MealEditor mealType="lunch" title="🍽️ Lunch" />
                <MealEditor mealType="snacks" title="☕ Snacks" />
                <MealEditor mealType="dinner" title="🌙 Dinner" />
              </div>

              <Button 
                onClick={handleSaveMenu} 
                disabled={isLoading}
                className="w-full"
                size="lg"
                variant="hero"
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
