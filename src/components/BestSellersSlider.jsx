import React, { useState, useEffect, useRef } from 'react';
import { products, formatPrice } from '../data/products';
import QuickViewModal from './QuickViewModal';

const BestSellersSlider = ({ currency, showToast }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const trackRef = useRef(null);

  const bestSellers = products.filter(p => p.isBestSeller);

  useEffect(() => {
    let animationId;
    const scrollStep = () => {
      if (!isPaused && !quickViewProduct && trackRef.current) {
        setScrollPosition((prev) => {
          // If we scrolled past the first set, reset to 0 for infinite loop
          const newPos = prev + 1;
          const maxScroll = trackRef.current.scrollWidth / 2; 
          return newPos >= maxScroll ? 0 : newPos;
        });
      }
      animationId = requestAnimationFrame(scrollStep);
    };
    animationId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, quickViewProduct]);

  return (
    <section className="section container" style={{ paddingBottom: 0 }}>
      <h2 className="section-title">Best Sellers</h2>
      
      <div 
        className="best-sellers-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="slider-track-container" ref={trackRef}>
          <div 
            className="slider-track"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {/* Render twice for infinite loop effect */}
            {[...bestSellers, ...bestSellers].map((product, index) => (
              <div key={`${product.id}-${index}`} className="slider-item">
                <div className="product-card">
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
                    <p className="product-price">{formatPrice(product.priceUSD, product.priceRWF, currency)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          currency={currency} 
          formatPrice={(usd, rwf) => formatPrice(usd, rwf, currency)} 
          onClose={() => setQuickViewProduct(null)}
          showToast={showToast}
        />
      )}
    </section>
  );
};

export default BestSellersSlider;
