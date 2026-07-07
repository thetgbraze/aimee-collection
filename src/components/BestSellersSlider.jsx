import React, { useState, useEffect, useRef } from 'react';
import { products, formatPrice } from '../data/products';
import QuickViewModal from './QuickViewModal';

const BestSellersSlider = ({ currency, showToast }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);

  const bestSellers = products.filter(p => p.isBestSeller);

  // Auto-scroll logic
  useEffect(() => {
    let intervalId;
    if (!isPaused && !quickViewProduct) {
      intervalId = setInterval(() => {
        if (trackRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
          // If we reach the end, jump back to start, else scroll right
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Scroll by one item roughly (280px + 32px gap = 312px)
            trackRef.current.scrollBy({ left: 312, behavior: 'smooth' });
          }
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaused, quickViewProduct]);

  const scrollLeftBtn = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -312, behavior: 'smooth' });
    }
  };

  const scrollRightBtn = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 312, behavior: 'smooth' });
    }
  };

  return (
    <section className="section container" style={{ paddingBottom: 0, paddingTop: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Best Sellers</h2>
        <div className="slider-nav">
          <button className="slider-nav-btn" onClick={scrollLeftBtn} aria-label="Previous">
            &#8592;
          </button>
          <button className="slider-nav-btn" onClick={scrollRightBtn} aria-label="Next">
            &#8594;
          </button>
        </div>
      </div>
      
      <div 
        className="best-sellers-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsPaused(false), 3000);
        }}
      >
        <div 
          className="slider-track"
          ref={trackRef}
        >
          {bestSellers.map((product) => (
            <div key={product.id} className="slider-item">
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
