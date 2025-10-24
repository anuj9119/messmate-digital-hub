import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CreditCard, Ticket } from "lucide-react";
import heroImage from "@/assets/hero-mess.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Modern hostel mess dining hall" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Welcome to <span className="text-secondary-foreground">MessMate</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Your digital companion for hassle-free hostel mess management. 
              View daily menus, pay online, and collect meals instantly.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <Button variant="hero" size="lg" className="gap-2">
              View Today's Menu <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary"
            >
              Pay for Meal <CreditCard className="h-5 w-5" />
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <FeatureCard 
              icon={<Calendar className="h-8 w-8" />}
              title="Daily Menu Updates"
              description="Get instant access to breakfast, lunch, snacks, and dinner menus"
            />
            <FeatureCard 
              icon={<CreditCard className="h-8 w-8" />}
              title="Quick Payments"
              description="Pay securely online and skip the queue at the mess"
            />
            <FeatureCard 
              icon={<Ticket className="h-8 w-8" />}
              title="Digital Tokens"
              description="Receive instant tokens after payment for food collection"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
      <div className="text-primary mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Hero;
