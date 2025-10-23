import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import MenuSection from "@/components/MenuSection";
import AdminSection from "@/components/AdminSection";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && !isAdmin) {
      navigate("/student");
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <MenuSection />
        <AdminSection />
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;