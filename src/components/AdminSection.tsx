import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Bell, Calendar, Users } from "lucide-react";

const AdminSection = () => {
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
            Upload menus, track payments, and notify students - all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <AdminCard 
            icon={<Upload className="h-8 w-8" />}
            title="Upload Menu"
            description="Add today's menu for all four meals"
            color="from-primary to-orange-600"
          />
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

        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Menu Upload</CardTitle>
              <CardDescription>Update today's menu for all students to see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MenuUploadField label="Breakfast" />
                <MenuUploadField label="Lunch" />
                <MenuUploadField label="Snacks" />
                <MenuUploadField label="Dinner" />
              </div>
              <Button className="w-full" size="lg" variant="secondary">
                <Upload className="mr-2 h-5 w-5" />
                Publish Menu & Notify Students
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

const MenuUploadField = ({ label }: { label: string }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">Click to add items</p>
      </div>
    </div>
  );
};

export default AdminSection;
