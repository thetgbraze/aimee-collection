import React from 'react';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ currency, setCurrency }) => {
  return (
    <header className="header">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="mobile-menu-btn icon-btn">
            <Menu size={24} />
          </button>
          
          <nav className="nav-links">
            <Link to="/new-arrivals" className="nav-link">New Arrivals</Link>
            <Link to="/clothing" className="nav-link">Clothing</Link>
            <Link to="/shoes" className="nav-link">Shoes</Link>
            <Link to="/bags" className="nav-link">Bags</Link>
            <Link to="/accessories" className="nav-link">Accessories</Link>
          </nav>
        </div>

        <div className="logo">
          <Link to="/">
            <img 
              src="/aimee_collection_logo_transparent.png" 
              alt="Aimee Collection Logo" 
              className="logo-img" 
            />
          </Link>
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
