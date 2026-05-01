import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import './index.css';

// A simple wrapper component for our sub-pages
const PagePlaceholder = ({ title, currency }) => (
  <div style={{ padding: '60px 0', minHeight: '50vh' }}>
    <div className="container">
      <h1 className="section-title" style={{ marginTop: '40px' }}>{title}</h1>
      <ProductGrid currency={currency} />
    </div>
  </div>
);

function App() {
  const [currency, setCurrency] = useState('RWF'); // Default to Rwandan Francs

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar currency={currency} setCurrency={setCurrency} />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <ProductGrid currency={currency} />
            </>
          } />
          <Route path="/new-arrivals" element={<PagePlaceholder title="New Arrivals" currency={currency} />} />
          <Route path="/clothing" element={<PagePlaceholder title="Clothing Collection" currency={currency} />} />
          <Route path="/shoes" element={<PagePlaceholder title="Premium Shoes" currency={currency} />} />
          <Route path="/bags" element={<PagePlaceholder title="Luxury Bags" currency={currency} />} />
          <Route path="/accessories" element={<PagePlaceholder title="Accessories" currency={currency} />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
