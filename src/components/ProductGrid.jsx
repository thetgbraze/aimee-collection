import React, { useState, useEffect, useRef } from 'react';
import QuickViewModal from './QuickViewModal';

import { products, formatPrice as sharedFormatPrice } from '../data/products';

const categories = ["All", "Clothing", "Shoes", "Bags", "Accessories"];

const ProductGrid = ({ currency, initialCategory, showToast }) => {
  const initialIndex = initialCategory ? categories.indexOf(initialCategory) : 0;
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isPaused, setIsPaused] = useState(!!initialCategory && initialCategory !== 'All');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const pauseTimeoutRef = useRef(null);

  const activeCategory = categories[activeCategoryIndex];

  // Auto-slide interval (disabled when initialCategory is set to a specific category)
  useEffect(() => {
    let intervalId;
    const shouldAutoSlide = !initialCategory || initialCategory === 'All';
    if (!isPaused && !quickViewProduct && shouldAutoSlide) {
      intervalId = setInterval(() => {
        setActiveCategoryIndex((prevIndex) => (prevIndex + 1) % categories.length);
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaused, quickViewProduct, initialCategory]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  const handleInteraction = () => {
    if (quickViewProduct || (initialCategory && initialCategory !== 'All')) return;
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  const handleMouseLeave = () => {
    if (quickViewProduct || (initialCategory && initialCategory !== 'All')) return;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    setIsPaused(false);
  };

  const formatPrice = (usd, rwf) => sharedFormatPrice(usd, rwf, currency);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <>
      <section 
        className="section container"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
        onMouseEnter={handleInteraction}
        onMouseLeave={handleMouseLeave}
      >
        <h2 className="section-title">New Arrivals</h2>
        
        <div className="category-tabs">
          {categories.map((category, index) => (
            <button 
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategoryIndex(index)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={product.image} alt={product.title} className="product-image" loading="lazy" />
                <div className="product-actions">
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                    }}
                  >
                    Quick View
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-price">{formatPrice(product.priceUSD, product.priceRWF)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          currency={currency} 
          formatPrice={formatPrice} 
          onClose={() => setQuickViewProduct(null)}
          showToast={showToast}
        />
      )}
    </>
  );
};

export default ProductGrid;
