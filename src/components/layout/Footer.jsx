import { Link } from 'react-router-dom';
import { Share2, Camera, MessageCircle, Video, MapPin, Phone, Mail, ArrowUp } from 'lucide-react';
import { scrollToTop } from '../../utils/helpers';

const Footer = () => {
  return (
    <footer className="bg-dark text-white relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                Food<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-text-light text-sm leading-relaxed mb-6">
              Hương vị đỉnh cao, trải nghiệm tuyệt vời. Đặt món online hoặc đặt bàn tại nhà hàng.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2, href: '#' },
                { icon: Camera, href: '#' },
                { icon: MessageCircle, href: '#' },
                { icon: Video, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 bg-dark-card hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {[
                { to: '/menu', label: 'Thực đơn' },
                { to: '/reservation', label: 'Đặt bàn' },
                { to: '/about', label: 'Về chúng tôi' },
                { to: '/contact', label: 'Liên hệ' },
                { to: '/login', label: 'Đăng nhập' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-text-light hover:text-primary text-sm transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span className="text-text-light text-sm">123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span className="text-text-light text-sm">0359 537 981</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span className="text-text-light text-sm">datt32285@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Giờ mở cửa</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Thứ 2 - Thứ 6</span>
                <span className="text-white font-medium">10:00 - 22:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Thứ 7 - CN</span>
                <span className="text-white font-medium">09:00 - 23:00</span>
              </div>
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-primary text-sm font-medium">🎉 Miễn phí ship đơn từ 200k</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-light text-sm">
            © 2026 FoodHub. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
