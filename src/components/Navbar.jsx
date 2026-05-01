import React from 'react';
import { ShoppingBag, Search, Menu } from 'lucide-react';

const Navbar = ({ currency, setCurrency }) => {
  return (
    <header className="header">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="mobile-menu-btn icon-btn">
            <Menu size={24} />
          </button>
          
          <nav className="nav-links">
            <a href="#" className="nav-link">New Arrivals</a>
            <a href="#" className="nav-link">Clothing</a>
            <a href="#" className="nav-link">Shoes</a>
            <a href="#" className="nav-link">Bags</a>
            <a href="#" className="nav-link">Accessories</a>
          </nav>
        </div>

        <div className="logo">
          <a href="#">
            <img 
              src="/aimee_collection_logo_transparent.png" 
              alt="Aimee Collection Logo" 
              className="logo-img" 
            />
          </a>
        </div>

        <div className="header-actions">
          <select 
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="RWF">RWF</option>
          </select>
          
          <button className="icon-btn">
            <Search size={20} />
          </button>
          
          <button className="icon-btn">
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
