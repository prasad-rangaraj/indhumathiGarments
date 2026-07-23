import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, CheckCircle2 } from 'lucide-react';
import indhumathiLogo from '@/assets/logo-new.png';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    setSubscribed(true);
    toast({
      title: "Subscribed Successfully!",
      description: "Thank you for subscribing to Indhumathi Garments newsletter.",
    });
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="relative bg-background/30 backdrop-blur-md border-t border-pink-200/40 mt-auto overflow-hidden">
      {/* Decorative subtle top line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-pink-300/30 via-pink-500/40 to-rose-400/30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img src={indhumathiLogo} alt="Indhumathi Garments" className="h-10 sm:h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Manufacturing high quality pure cotton women inners. Comfort and elegance for over two decades.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/profile?tab=orders" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-pink-600 transition-colors inline-block py-0.5">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
              Newsletter
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscribe to get updates on new products and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-pink-200/50 bg-background/60 backdrop-blur-xs text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-xs"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 p-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {subscribed ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </button>
              </div>
              {subscribed && (
                <p className="text-xs font-medium text-green-600 flex items-center gap-1 animate-fade-in pl-1">
                  <CheckCircle2 className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pink-100/80 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {settings?.siteName || 'Indhumathi'}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-pink-600 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-pink-600 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




