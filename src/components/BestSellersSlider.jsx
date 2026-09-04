import React, { useState, useEffect, useRef, useCallback } from 'react';
import { products, formatPrice } from '../data/products';
import QuickViewModal from './QuickViewModal';
import { ChevronLeft, ChevronRight, Heart, Eye, Star, ShoppingBag } from 'lucide-react';

const BestSellersSlider = ({
  currency,
  showToast,
  category,
  wishlistIds = [],
  toggleWishlist,
  addToCart
}) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);

  // Tap-to-reveal: tracks which product image was tapped on touch devices
  const [touchedProductId, setTouchedProductId] = useState(null);

  const bestSellers = products.filter(p => p.isBestSeller && (!category || category === 'All' || p.category === category));

  useEffect(() => {
    let intervalId;
    if (!isPaused && !quickViewProduct && bestSellers.length > 0) {
      intervalId = setInterval(() => {
        if (trackRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            trackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
          }
        }
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaused, quickViewProduct, bestSellers.length]);

  const scrollLeftBtn = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRightBtn = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Dismiss revealed actions when tapping outside a product image container
  const handleGlobalTap = useCallback((e) => {
    if (!e.target.closest('.product-image-container')) {
      setTouchedProductId(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('touchstart', handleGlobalTap, { passive: true });
    document.addEventListener('click', handleGlobalTap);
    return () => {
      document.removeEventListener('touchstart', handleGlobalTap);
      document.removeEventListener('click', handleGlobalTap);
    };
  }, [handleGlobalTap]);

  const handleImageTap = (e, productId) => {
    // Activate on touch-capable devices and mobile viewports
    const isTouch = 
      window.matchMedia('(hover: none)').matches || 
      window.matchMedia('(pointer: coarse)').matches || 
      window.innerWidth <= 768;

    if (isTouch) {
      e.stopPropagation();
      setIsPaused(true); // Pause the auto-scroll while user is exploring
      setTouchedProductId(prev => prev === productId ? null : productId);
    }
  };

  if (bestSellers.length === 0) return null;

  return (
    <section className="section container" style={{ paddingBottom: 0, paddingTop: '40px' }}>
      <div className="section-header-flex justify-between items-center" style={{ marginBottom: '20px' }}>
        <div>
          <span className="section-tag">MOST COVETED PIECES</span>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Best Sellers</h2>
        </div>
        <div className="slider-nav-arrows flex gap-2">
          <button className="slider-nav-btn" onClick={scrollLeftBtn} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button className="slider-nav-btn" onClick={scrollRightBtn} aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        className="best-sellers-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => { setIsPaused(false); setTouchedProductId(null); }}
      >
        <div className="slider-track" ref={trackRef}>
          {bestSellers.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isTouched = touchedProductId === product.id;

            return (
              <div key={product.id} className="slider-item">
                <div className="product-card">
                  <div
                    className={`product-image-container${isTouched ? ' is-touched' : ''}`}
                    onTouchStart={(e) => handleImageTap(e, product.id)}
                    onClick={(e) => handleImageTap(e, product.id)}
                  >
                    <span className="product-badge bestseller">BESTSELLER</span>

                    <button
                      className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      aria-label="Wishlist"
                    >
                      <Heart size={18} fill={isWishlisted ? '#D4AF37' : 'none'} color={isWishlisted ? '#D4AF37' : '#111111'} />
                    </button>

                    <img src={product.image} alt={product.title} className="product-image primary" loading="lazy" />
                    {product.secondaryImage && (
                      <img src={product.secondaryImage} alt={`${product.title} lifestyle view`} className="product-image secondary" loading="lazy" />
                    )}

                    {/* Tap-to-reveal hint on mobile */}
                    <div className="touch-hint" aria-hidden="true">
                      <span>Tap to explore</span>
                    </div>

                    <div className="product-actions">
                      <button
                        className="btn btn-quick-view flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                          setTouchedProductId(null);
                        }}
                      >
                        <Eye size={16} /> QUICK VIEW
                      </button>
                      <button
                        className="btn-add-cart-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, "Small: UK 8-10", 1);
                          if (showToast) showToast(`Added ${product.title} to bag!`, 'success');
                          setTouchedProductId(null);
                        }}
                        aria-label="Add to Bag"
                        title="Add to Bag"
                      >
                        <ShoppingBag size={20} color="#0d0d0d" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="product-info">
                    <span className="product-category-text">{product.category}</span>
                    <h3 className="product-title" onClick={() => setQuickViewProduct(product)}>{product.title}</h3>
                    <div className="product-rating-row">
                      <Star size={14} fill="#D4AF37" color="#D4AF37" />
                      <span className="rating-score">{product.rating}</span>
                      <span className="reviews-count">({product.reviewsCount})</span>
                    </div>
                    <p className="product-price">{formatPrice(product.priceUSD, product.priceRWF, currency)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          currency={currency}
          formatPrice={(usd, rwf) => formatPrice(usd, rwf, currency)}
          onClose={() => setQuickViewProduct(null)}
          showToast={showToast}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isWishlisted={wishlistIds.includes(quickViewProduct.id)}
        />
      )}
    </section>
  );
};

export default BestSellersSlider;
