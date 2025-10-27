import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import PaymentSection from "@/components/PaymentSection";
import Footer from "@/components/Footer";

const Index = () => {
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
