import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';

const Navbar = ({ 
  currency, 
  setCurrency, 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  onOpenSearch,
  onOpenAuth 
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <div className="container flex items-center justify-between">
        
        {/* Left Side: Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <button 
            className="mobile-menu-btn icon-btn"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile + Desktop Nav */}
        <nav
          id="mobile-nav"
          className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`} 
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.name}
            </Link>
          ))}

          {/* Currency selector in mobile nav drawer */}
          <div className="mobile-nav-currency">
            <span className="mobile-nav-currency-label">Currency</span>
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => { setCurrency(e.target.value); setIsMobileMenuOpen(false); }}
              aria-label="Select Currency"
            >
              <option value="USD">USD ($)</option>
              <option value="RWF">RWF (FRw)</option>
            </select>
          </div>
        </nav>

        {/* Center: Brand Logo — absolutely centered */}
        <div className="logo">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-brand-wrap">
              <span className="logo-title">AIMEE</span>
              <span className="logo-sub">COLLECTION</span>
            </div>
          </Link>
        </div>

        {/* Right Side: Currency (desktop) & Action Icons */}
        <div className="header-actions">
          {/* Desktop-only currency selector */}
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
            aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
            onClick={onOpenWishlist}
            title="View Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && <span className="badge-count wishlist" aria-hidden="true">{wishlistCount}</span>}
          </button>
          
          <button 
            className="icon-btn action-badge-btn" 
            aria-label={`Shopping bag${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
            onClick={onOpenCart}
            title="View Bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge-count cart" aria-hidden="true">{cartCount}</span>}
          </button>

          <UserMenu onOpenAuth={onOpenAuth} />
        </div>

      </div>

      {/* Mobile nav backdrop — click to close */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Navbar;
