import { Link } from 'react-router-dom';
import { Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="washx-footer">
      <div className="washx-footer-container">
        <div className="washx-footer-content">
          
          {/* Brand Section */}
          <div className="washx-footer-brand">
            <h3 className="washx-footer-logo">
              WashX
            </h3>
            <p className="washx-footer-tagline">
              Your trusted laundry service platform.
            </p>
            
            <div className="washx-social-links">
              <a href="#" className="washx-social-link" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="washx-social-link" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="washx-social-link" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="washx-footer-links">
            <h4 className="washx-footer-title">Quick Links</h4>
            <ul className="washx-footer-list">
              <li><Link to="/" className="washx-footer-link">Home</Link></li>
              <li><Link to="/services" className="washx-footer-link">Services</Link></li>
              <li><Link to="/how-it-works" className="washx-footer-link">How It Works</Link></li>
              <li><Link to="/register" className="washx-footer-link">Join Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="washx-footer-contact">
            <h4 className="washx-footer-title">Contact</h4>
            <div className="washx-contact-item">
              <Mail size={16} />
              <span>support@washx.com</span>
            </div>
            <div className="washx-contact-item">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="washx-footer-bottom">
          <p>&copy; 2026 WashX. All rights reserved.</p>
          <div className="washx-footer-legal">
            <Link to="/terms" className="washx-legal-link">Terms</Link>
            <span className="washx-divider">•</span>
            <Link to="/privacy" className="washx-legal-link">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;