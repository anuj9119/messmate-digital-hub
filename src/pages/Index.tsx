import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import PaymentSection from "@/components/PaymentSection";
import AdminSection from "@/components/AdminSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <Hero />
        <MenuSection />
        <PaymentSection />
        <AdminSection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
