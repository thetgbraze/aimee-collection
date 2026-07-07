import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';

// Reusable Toast component for user feedback
const Toast = ({ message, type, visible }) => (
  <div className={`toast ${type} ${visible ? 'show' : ''}`}>
    {message}
  </div>
);

// Sub-page wrapper with category filtering
const PagePlaceholder = ({ title, category, currency, showToast }) => (
  <div className="page-placeholder">
    <div className="container">
      <h1 className="section-title">{title}</h1>
      <ProductGrid currency={currency} initialCategory={category} showToast={showToast} />
    </div>
  </div>
);

function App() {
  const [currency, setCurrency] = useState('RWF');
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar currency={currency} setCurrency={setCurrency} showToast={showToast} />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <ProductGrid currency={currency} showToast={showToast} />
            </>
          } />
          <Route path="/new-arrivals" element={<PagePlaceholder title="New Arrivals" category="All" currency={currency} showToast={showToast} />} />
          <Route path="/clothing" element={<PagePlaceholder title="Clothing Collection" category="Clothing" currency={currency} showToast={showToast} />} />
          <Route path="/shoes" element={<PagePlaceholder title="Premium Shoes" category="Shoes" currency={currency} showToast={showToast} />} />
          <Route path="/bags" element={<PagePlaceholder title="Luxury Bags" category="Bags" currency={currency} showToast={showToast} />} />
          <Route path="/accessories" element={<PagePlaceholder title="Accessories" category="Accessories" currency={currency} showToast={showToast} />} />
        </Routes>
        <Footer showToast={showToast} />
        <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      </div>
    </BrowserRouter>
  );
}

export default App;
