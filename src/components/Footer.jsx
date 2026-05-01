import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4 className="footer-heading">Aimee Collection</h4>
            <p style={{ color: '#a0a0a0', fontSize: '0.95rem' }}>
              Premium fashion for the modern woman. Shop our exclusive collection of clothing, shoes, bags, and accessories.
            </p>
          </div>
          
          <div>
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li><Link to="/new-arrivals" className="footer-link">New In Store</Link></li>
              <li><Link to="/clothing" className="footer-link">Clothing</Link></li>
              <li><Link to="/shoes" className="footer-link">Shoes</Link></li>
              <li><Link to="/bags" className="footer-link">Bags</Link></li>
              <li><Link to="/accessories" className="footer-link">Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="footer-heading">Help</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Customer Service</a></li>
              <li><a href="#" className="footer-link">Delivery Options</a></li>
              <li><a href="#" className="footer-link">Returns & Exchanges</a></li>
              <li><a href="#" className="footer-link">Size Guide</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="footer-heading">Newsletter</h4>
            <p style={{ color: '#a0a0a0', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aimee Collection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
