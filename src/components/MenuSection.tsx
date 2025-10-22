import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Sun, Cookie, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MealData {
  title: string;
  icon: React.ReactNode;
  time: string;
  items: string;
  color: string;
}

const MenuSection = () => {
  const [menu, setMenu] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const fetchTodayMenu = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("menu_date", today)
        .maybeSingle();

      if (error) throw error;
      setMenu(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const todayMenu: MealData[] = [
    {
      title: "Breakfast",
      icon: <Coffee className="h-6 w-6" />,
      time: "7:00 AM - 9:00 AM",
      color: "from-orange-400 to-orange-600",
      items: menu?.breakfast || "Not available",
    },
    {
      title: "Lunch",
      icon: <Sun className="h-6 w-6" />,
      time: "12:30 PM - 2:30 PM",
      color: "from-yellow-400 to-amber-600",
      items: menu?.lunch || "Not available",
    },
    {
      title: "Snacks",
      icon: <Cookie className="h-6 w-6" />,
      time: "5:00 PM - 6:00 PM",
      color: "from-pink-400 to-rose-600",
      items: menu?.snacks || "Not available",
    },
    {
      title: "Dinner",
      icon: <Moon className="h-6 w-6" />,
      time: "8:00 PM - 10:00 PM",
      color: "from-indigo-400 to-purple-600",
      items: menu?.dinner || "Not available",
    },
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading today's menu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Today's Menu - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What's Cooking Today?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {menu ? "Fresh, delicious meals prepared with love for our hostel family" : "No menu available for today"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {todayMenu.map((meal, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
            >
              <CardHeader className={`bg-gradient-to-r ${meal.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {meal.icon}
                    <div>
                      <CardTitle className="text-2xl">{meal.title}</CardTitle>
                      <p className="text-white/90 text-sm mt-1">{meal.time}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-foreground">
                  <p className="text-lg">{meal.items}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
