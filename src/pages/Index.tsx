import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import PaymentSection from "@/components/PaymentSection";
import AdminSection from "@/components/AdminSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <MenuSection />
      <PaymentSection />
      <AdminSection />
      <Footer />
    </div>
  );
};

export default Index;
