import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import './index.css';

function App() {
  const [currency, setCurrency] = useState('RWF'); // Default to Rwandan Francs

  return (
    <div className="app">
      <Navbar currency={currency} setCurrency={setCurrency} />
      <Hero />
      <ProductGrid currency={currency} />
      <Footer />
    </div>
  );
}

export default App;
