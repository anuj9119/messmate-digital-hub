import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import PaymentSection from "@/components/PaymentSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check user role and redirect accordingly
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <main className="min-h-screen">
      <Hero />
      <MenuSection />
      <PaymentSection />
      <Footer />
    </main>
  );
};

export default Index;
