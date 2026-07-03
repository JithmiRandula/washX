import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, ArrowRight, Sparkles } from 'lucide-react';
import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home',         to: '/'           },
  { label: 'Services',     to: '/services'   },
  { label: 'How It Works', to: '/how-it-works'},
  { label: 'About Us',     to: '/about'      },
  { label: 'Join Us',      to: '/register'   },
];

const SERVICES = [
  'Dry Cleaning',
  'Wash & Fold',
  'Express Service',
  'Ironing Service',
  'Steam Press',
  'Premium Care',
];

const Footer = () => {
  return (
    <footer className="wxf-footer">
      {/* Top accent line */}
      <div className="wxf-accent-bar" />

      <div className="wxf-container">

        {/* ── Main Grid ── */}
        <div className="wxf-grid">

          {/* Brand */}
          <div className="wxf-brand">
            <div className="wxf-logo">
              <span className="wxf-logo-wash">Wash</span><span className="wxf-logo-x">X</span>
            </div>
            <p className="wxf-tagline">
              Your trusted laundry service platform — connecting you with top-rated providers for a fresh, clean experience every time.
            </p>
            <div className="wxf-badge">
              <Sparkles size={13} /> Premium Laundry Services
            </div>
            <div className="wxf-socials">
              <a href="#" className="wxf-social wxf-fb"  aria-label="Facebook" ><Facebook  size={17} /></a>
              <a href="#" className="wxf-social wxf-ig"  aria-label="Instagram"><Instagram size={17} /></a>
              <a href="#" className="wxf-social wxf-tw"  aria-label="Twitter"  ><Twitter   size={17} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="wxf-col">
            <h4 className="wxf-col-title">Quick Links</h4>
            <ul className="wxf-list">
              {QUICK_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="wxf-link">
                    <ArrowRight size={13} className="wxf-link-arrow" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="wxf-col">
            <h4 className="wxf-col-title">Our Services</h4>
            <ul className="wxf-list">
              {SERVICES.map(s => (
                <li key={s}>
                  <Link to="/services" className="wxf-link">
                    <ArrowRight size={13} className="wxf-link-arrow" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="wxf-col">
            <h4 className="wxf-col-title">Get In Touch</h4>
            <div className="wxf-contacts">
              <a href="mailto:support@washx.com" className="wxf-contact-item">
                <div className="wxf-contact-icon"><Mail size={15} /></div>
                <div>
                  <span className="wxf-contact-lbl">Email Us</span>
                  <span className="wxf-contact-val">support@washx.com</span>
                </div>
              </a>
              <a href="tel:+15551234567" className="wxf-contact-item">
                <div className="wxf-contact-icon"><Phone size={15} /></div>
                <div>
                  <span className="wxf-contact-lbl">Call Us</span>
                  <span className="wxf-contact-val">+1 (555) 123-4567</span>
                </div>
              </a>
              <div className="wxf-contact-item">
                <div className="wxf-contact-icon"><MapPin size={15} /></div>
                <div>
                  <span className="wxf-contact-lbl">Location</span>
                  <span className="wxf-contact-val">Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="wxf-bottom">
          <p className="wxf-copy">
            © 2026 <span className="wxf-copy-brand">WashX</span>. All rights reserved. Made with ♥ in Sri Lanka.
          </p>
          <div className="wxf-legal">
            <Link to="/terms"   className="wxf-legal-link">Terms of Service</Link>
            <span className="wxf-dot" />
            <Link to="/privacy" className="wxf-legal-link">Privacy Policy</Link>
            <span className="wxf-dot" />
            <Link to="/cookies" className="wxf-legal-link">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
