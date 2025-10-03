import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Sun, Cookie, Moon } from "lucide-react";

interface MenuItem {
  name: string;
  description: string;
  category: string;
}

interface MealData {
  title: string;
  icon: React.ReactNode;
  time: string;
  items: MenuItem[];
  color: string;
}

const MenuSection = () => {
  const todayMenu: MealData[] = [
    {
      title: "Breakfast",
      icon: <Coffee className="h-6 w-6" />,
      time: "7:00 AM - 9:00 AM",
      color: "from-orange-400 to-orange-600",
      items: [
        { name: "Idli Sambar", description: "Soft steamed rice cakes with lentil curry", category: "Main" },
        { name: "Vada", description: "Crispy lentil donuts", category: "Side" },
        { name: "Masala Tea", description: "Fresh brewed spiced tea", category: "Beverage" },
      ],
    },
    {
      title: "Lunch",
      icon: <Sun className="h-6 w-6" />,
      time: "12:30 PM - 2:30 PM",
      color: "from-yellow-400 to-amber-600",
      items: [
        { name: "Chapati", description: "Whole wheat flatbread", category: "Main" },
        { name: "Dal Fry", description: "Tempered lentils", category: "Curry" },
        { name: "Paneer Butter Masala", description: "Cottage cheese in creamy tomato gravy", category: "Curry" },
        { name: "Jeera Rice", description: "Cumin flavored basmati rice", category: "Rice" },
        { name: "Salad & Curd", description: "Fresh vegetables and yogurt", category: "Side" },
      ],
    },
    {
      title: "Snacks",
      icon: <Cookie className="h-6 w-6" />,
      time: "5:00 PM - 6:00 PM",
      color: "from-pink-400 to-rose-600",
      items: [
        { name: "Samosa", description: "Crispy pastry with potato filling", category: "Main" },
        { name: "Coffee", description: "Hot filter coffee", category: "Beverage" },
      ],
    },
    {
      title: "Dinner",
      icon: <Moon className="h-6 w-6" />,
      time: "8:00 PM - 10:00 PM",
      color: "from-indigo-400 to-purple-600",
      items: [
        { name: "Roti", description: "Indian flatbread", category: "Main" },
        { name: "Mixed Vegetable Curry", description: "Seasonal vegetables in curry", category: "Curry" },
        { name: "Dal Tadka", description: "Yellow lentils with tempering", category: "Curry" },
        { name: "Steamed Rice", description: "Plain basmati rice", category: "Rice" },
        { name: "Papad & Pickle", description: "Crispy wafer and tangy pickle", category: "Side" },
      ],
    },
  ];

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
            Fresh, delicious meals prepared with love for our hostel family
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
                <div className="space-y-4">
                  {meal.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {item.category}
                      </Badge>
                    </div>
                  ))}
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
