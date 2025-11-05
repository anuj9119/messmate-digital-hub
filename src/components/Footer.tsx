import { Facebook, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary to-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">MessMate</h3>
            <p className="text-white/90">
              Making hostel mess management simple, transparent, and efficient for everyone.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/90">
              <li><a href="#" className="hover:text-white transition-colors">View Menu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Make Payment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Admin Login</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-white/90">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 9119194546</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@messmate.com</span>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="#" className="hover:scale-110 transition-transform">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="hover:scale-110 transition-transform">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
          <p>&copy; 2025 MessMate. All rights reserved. Built with ❤️ for hostel students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
