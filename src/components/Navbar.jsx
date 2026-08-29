import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Menu, X, Heart, ChevronLeft } from 'lucide-react';
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

  // Swipe-to-dismiss gesture state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchCurrentX, setTouchCurrentX] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const navRef = useRef(null);

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

  // Touch gesture handlers for sliding drawer away
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentX(currentX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      // If user swiped left by 40px or more, slide the nav away
      if (diff < -40) {
        setIsMobileMenuOpen(false);
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setIsSwiping(false);
  };

  // Calculate live drag position while swiping left
  const dragOffset = (isSwiping && touchStartX !== null && touchCurrentX !== null)
    ? Math.min(0, touchCurrentX - touchStartX)
    : 0;

  const dynamicDrawerStyle = isMobileMenuOpen && dragOffset < 0
    ? { transform: `translateX(${dragOffset}px)`, transition: 'none' }
    : undefined;

  return (
    <header className="header">
      <div className="container header-container flex items-center justify-between">
        
        {/* Left Side: Mobile Menu Button & Desktop Navigation */}
        <div className="header-left flex items-center gap-4">
          <button 
            className="mobile-menu-btn icon-btn"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav-links" aria-label="Main desktop navigation">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`} 
                aria-current={location.pathname === link.path ? 'page' : undefined}
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

      {/* Mobile Drawer (with Swipe-to-Dismiss) */}
      <nav
        id="mobile-nav"
        ref={navRef}
        className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        style={dynamicDrawerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Mobile navigation"
      >
        {/* Drawer Top Bar with Close & Swipe Hint */}
        <div className="mobile-nav-topbar">
          <div className="mobile-nav-brand">
            <span className="logo-title">AIMEE</span>
            <span className="logo-sub">COLLECTION</span>
          </div>
          <button 
            className="mobile-nav-close-icon"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mobile-nav-swipe-indicator">
          <ChevronLeft size={14} className="swipe-chevron" />
          <span>Slide left to close</span>
        </div>

        {/* Navigation Links */}
        <div className="mobile-nav-items">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`mobile-nav-item-link ${location.pathname === link.path ? 'active' : ''}`} 
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

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

      {/* Mobile nav backdrop — swipe or tap to dismiss */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          onTouchStart={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Navbar;
