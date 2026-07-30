import { Globe, MessageCircle, Camera, Video, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import darkLogo from '../assets/logo/logo-dark.png';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-nexus-textSecondary pt-14 sm:pt-20 pb-8 sm:pb-10 border-t border-nexus-border relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[300px] bg-primary/10 blur-[100px] sm:blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 4-column grid — stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-start mb-12 sm:mb-16">

          {/* Brand Col */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <Link to="/">
              <img
                src={darkLogo}
                alt="NexusTech Hub"
                style={{ imageRendering: 'auto' }}
                className="h-9 sm:h-11 lg:h-12 w-auto object-contain hover:scale-105 transition-transform drop-shadow-[0_0_20px_rgba(255,114,76,0.35)]"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Premium electronics and cutting-edge tech gadgets designed to elevate your everyday life.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold text-base sm:text-lg">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-sm">
              {['Shop All', 'New Arrivals', 'Best Sellers', 'Deals & Promotions', 'About Us'].map((label) => (
                <li key={label}>
                  <Link to={label === 'About Us' ? '/about' : '/products'} className="text-nexus-textSecondary hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold text-base sm:text-lg">Customer Support</h4>
            <ul className="flex flex-col gap-4 text-sm">
              {['Help Center', 'Track Order', 'Returns & Exchanges', 'Shipping Info', 'Warranty'].map((label) => {
                const route = label === 'Help Center' ? '/help' : '/contact';
                return (
                  <li key={label}>
                    <Link to={route} className="text-nexus-textSecondary hover:text-primary transition-colors">{label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold text-base sm:text-lg">Contact Us</h4>
            <ul className="flex flex-col gap-5 text-sm">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium mb-1">Location</span>
                  <span className="text-nexus-textSecondary leading-relaxed">Meru, Kenya</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Phone size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium mb-1">Phone</span>
                  <a href="tel:+254728097596" className="text-nexus-textSecondary hover:text-primary transition-colors">+254 728 097 596</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Mail size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium mb-1">Email</span>
                  <a href="mailto:muriithiderrick08@gmail.com" className="text-nexus-textSecondary hover:text-primary transition-colors break-all">muriithiderrick08@gmail.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-nexus-border flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-nexus-textSecondary">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} NexusTech Hub. All rights reserved.</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-nexus-textSecondary text-xs uppercase tracking-wider font-semibold">Accepted Payments</span>
            <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-nexus-border backdrop-blur-md">
              <div className="bg-white rounded-md flex items-center justify-center h-9 w-[60px] p-1.5 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/M-PESA.png" alt="M-Pesa" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="bg-white rounded-md flex items-center justify-center h-9 w-[60px] p-1.5 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="bg-white rounded-md flex items-center justify-center h-9 w-[60px] p-1.5 shadow-sm">
                <img src="https://play-lh.googleusercontent.com/3RNeYhy3MBYV8XMZUz14vGXTOv0MsXGTu6DTW1HHX0EHmRenDxMtYtchfhxCfD-o8awWrk4z30F7FoGvWVq1GA=w416-h235-rw" alt="Visa" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="bg-white rounded-md flex items-center justify-center h-9 w-[60px] p-1.5 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
