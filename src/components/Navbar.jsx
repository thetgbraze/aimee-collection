import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ 
  currency, 
  setCurrency, 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  onOpenSearch 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Clothing', path: '/clothing' },
    { name: 'Shoes', path: '/shoes' },
    { name: 'Bags', path: '/bags' },
    { name: 'Accessories', path: '/accessories' },
  ];

  return (
    <header className="header">
      <div className="container flex items-center justify-between">
        
        {/* Left Side: Mobile Menu Button & Desktop Links */}
        <div className="flex items-center gap-4">
          <button 
            className="mobile-menu-btn icon-btn"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          
          <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <div className="logo">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-brand-wrap">
              <span className="logo-title">AIMEE</span>
              <span className="logo-sub">COLLECTION</span>
            </div>
          </Link>
        </div>

        {/* Right Side: Currency & Actions */}
        <div className="header-actions">
          <div className="currency-selector-box">
            <select 
              id="currency-select"
              className="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select Currency"
            >
              <option value="USD">USD ($)</option>
              <option value="RWF">RWF (FRw)</option>
            </select>
          </div>
          
          <button 
            className="icon-btn search-trigger" 
            aria-label="Search products"
            onClick={onOpenSearch}
            title="Search Products"
          >
            <Search size={20} />
          </button>

          <button 
            className="icon-btn action-badge-btn" 
            aria-label="Wishlist"
            onClick={onOpenWishlist}
            title="View Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && <span className="badge-count wishlist">{wishlistCount}</span>}
          </button>
          
          <button 
            className="icon-btn action-badge-btn" 
            aria-label="Shopping bag"
            onClick={onOpenCart}
            title="View Bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge-count cart">{cartCount}</span>}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
