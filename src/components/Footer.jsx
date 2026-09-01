import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone, Mail, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

const Footer = ({ showToast }) => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      if (showToast) showToast('Thank you for subscribing! Your 10% discount code is AIMEE10 ✦', 'success');
      setEmail('');
    }
  };

  const handleComingSoon = (infoText) => (e) => {
    e.preventDefault();
    if (showToast) showToast(infoText || 'Customer service page coming soon!', 'info');
  };

  return (
    <footer className="footer">
      <div className="container">

        {/* Top Newsletter Banner in Footer */}
        <div className="footer-newsletter-banner">
          <div className="newsletter-text-content">
            <span className="gold-text-tag">JOIN THE AIMEE CLUB</span>
            <h3>Receive 10% Off Your First Purchase</h3>
            <p>Subscribe for private haute couture previews, VIP invitations, and bespoke styling tips.</p>
          </div>

          <form className="newsletter-form-inline" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address..."
              className="newsletter-input-inline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email for newsletter"
            />
            <button type="submit" className="btn btn-gold flex items-center gap-1">
              SUBSCRIBE <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Footer Navigation Columns Grid */}
        <div className="footer-grid">

          <div className="footer-col brand-col">
            <div className="logo-brand-wrap" style={{ marginBottom: '16px' }}>
              <span className="logo-title" style={{ color: '#ffffff' }}>AIMEE</span>
              <span className="logo-sub" style={{ color: '#D4AF37' }}>COLLECTION</span>
            </div>
            <p className="footer-description">
              Unapologetic luxury and high fashion for the modern woman. Handcrafted garments, bags, shoes, and jewelry delivered across Rwanda and worldwide.
            </p>
            <div className="contact-info-list" style={{ marginTop: '16px' }}>
              <p><MapPin size={14} className="gold-icon" /> Nyarutarama, Kigali, Rwanda</p>
              <p><Phone size={14} className="gold-icon" /> +250 788 123 456 / WhatsApp</p>
              <p><Mail size={14} className="gold-icon" /> concierge@aimeecollection.rw</p>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Shop Collections</h4>
            <ul className="footer-links">
              <li><Link to="/new-arrivals" className="footer-link">New Arrivals ✦</Link></li>
              <li><Link to="/clothing" className="footer-link">Haute Clothing</Link></li>
              <li><Link to="/shoes" className="footer-link">Stilettos & Footwear</Link></li>
              <li><Link to="/bags" className="footer-link">Italian Leather Bags</Link></li>
              <li><Link to="/accessories" className="footer-link">Jewelry & Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Client Concierge</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link" onClick={handleComingSoon('Delivery to Kigali (2-4 hrs) & Worldwide Shipping (2-4 days)')}>Delivery & Express Shipping</a></li>
              <li><a href="#" className="footer-link" onClick={handleComingSoon('14-day return policy for unused items in original dustbag')}>Returns & Exchanges</a></li>
              <li><a href="#" className="footer-link" onClick={handleComingSoon('Size guide for UK, US, EU fashion standards')}>Sizing & Fit Advice</a></li>
              <li><a href="#" className="footer-link" onClick={handleComingSoon('Contact via WhatsApp: +250 788 123 456')}>Contact Concierge</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Follow & Connect</h4>
            <p className="footer-description">
              Follow our social media accounts for updates and promotions.
            </p>
            <div className="social-links-flex">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="WhatsApp">
                <Phone size={18} />
              </a>
              <a href="#" onClick={handleComingSoon('Pinterest coming soon!')} className="social-icon-btn" aria-label="Pinterest">
                <span>P</span>
              </a>
              <a href="#" onClick={handleComingSoon('TikTok coming soon!')} className="social-icon-btn" aria-label="TikTok">
                <span>T</span>
              </a>
            </div>

            <div className="trust-badge-footer">
              <ShieldCheck size={18} className="gold-icon" />
              <span>100% Guaranteed Authentic</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="footer-bottom-flex">
          <p>&copy; {new Date().getFullYear()} Aimee Collection. All rights reserved. Designed by Braze Inc.</p>

          <div className="payment-badges-flex">
            <span className="payment-badge">MTN Mobile Money</span>
            <span className="payment-badge">Airtel Money</span>
            <span className="payment-badge">VISA</span>
            <span className="payment-badge">Mastercard</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
