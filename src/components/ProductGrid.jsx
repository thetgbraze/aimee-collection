import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import QuickViewModal from './QuickViewModal';
import { products, formatPrice as sharedFormatPrice } from '../data/products';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';

const categoryRoutes = {
  "All": "/new-arrivals",
  "Clothing": "/clothing",
  "Shoes": "/shoes",
  "Bags": "/bags",
  "Accessories": "/accessories",
};
const categories = Object.keys(categoryRoutes);

const ProductGrid = ({
  currency,
  initialCategory,
  showToast,
  wishlistIds = [],
  toggleWishlist,
  addToCart
}) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const location = useLocation();

  // Sync active category when navigating between routes
  useEffect(() => {
    setActiveCategory(initialCategory || "All");
  }, [initialCategory, location.pathname]);
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Tap-to-reveal: tracks which product image was tapped on touch devices
  const [touchedProductId, setTouchedProductId] = useState(null);

  const formatPrice = (usd, rwf) => sharedFormatPrice(usd, rwf, currency);

  // Dismiss revealed actions when tapping anywhere outside a product card
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
    // Only activate tap-to-reveal behaviour on touch-capable devices
    if (window.matchMedia('(hover: none)').matches) {
      e.stopPropagation();
      setTouchedProductId(prev => prev === productId ? null : productId);
    }
  };

  // Filter products by category
  let filtered = activeCategory === "All"
    ? [...products]
    : products.filter(p => p.category === activeCategory);

  // Sort products
  if (sortBy === "price-low") {
    filtered.sort((a, b) => (currency === 'RWF' ? a.priceRWF - b.priceRWF : a.priceUSD - b.priceUSD));
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => (currency === 'RWF' ? b.priceRWF - a.priceRWF : b.priceUSD - a.priceUSD));
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <>
      <section className="section container">
        <div className="section-header-centered">
          <span className="section-tag">HAUTE COUTURE SELECTION</span>
          <h2 className="section-title">New Arrivals &amp; Collection</h2>
          <div className="section-divider"></div>
        </div>

        {/* Controls: Category Tabs & Sort Dropdown */}
        <div className="grid-controls-flex">
          <div className="category-tabs">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={categoryRoutes[cat]}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="sort-selector-box">
            <label htmlFor="sort-select" className="sort-label">Sort By:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="product-grid">
          {filtered.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isTouched = touchedProductId === product.id;

            return (
              <div key={product.id} className="product-card">
                <div
                  className={`product-image-container${isTouched ? ' is-touched' : ''}`}
                  onTouchStart={(e) => handleImageTap(e, product.id)}
                  onClick={(e) => handleImageTap(e, product.id)}
                >
                  {/* Badge */}
                  {product.badge && (
                    <span className={`product-badge ${product.badge.toLowerCase().replaceAll(' ', '-')}`}>
                      {product.badge}
                    </span>
                  )}

                  {/* Wishlist Heart Toggle */}
                  <button
                    className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={18} fill={isWishlisted ? '#D4AF37' : 'none'} color={isWishlisted ? '#D4AF37' : '#111111'} />
                  </button>

                  {/* Dual Image Hover */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="product-image primary"
                    loading="lazy"
                  />
                  {product.secondaryImage && (
                    <img
                      src={product.secondaryImage}
                      alt={`${product.title} lifestyle view`}
                      className="product-image secondary"
                      loading="lazy"
                    />
                  )}

                  {/* Tap-to-reveal hint on mobile (shown when NOT touched) */}
                  <div className="touch-hint" aria-hidden="true">
                    <span>Tap to explore</span>
                  </div>

                  {/* Action Bar — hover on desktop, tap-revealed on mobile */}
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

                {/* Product Info */}
                <div className="product-info">
                  <span className="product-category-text">{product.category}</span>
                  <h3 className="product-title" onClick={() => setQuickViewProduct(product)}>
                    {product.title}
                  </h3>

                  {/* Rating Stars */}
                  <div className="product-rating-row">
                    <div className="stars-flex">
                      <Star size={14} fill="#D4AF37" color="#D4AF37" />
                      <span className="rating-score">{product.rating}</span>
                    </div>
                    <span className="reviews-count">({product.reviewsCount})</span>
                  </div>

                  {/* Price */}
                  <p className="product-price">{formatPrice(product.priceUSD, product.priceRWF)}</p>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          currency={currency}
          formatPrice={formatPrice}
          onClose={() => setQuickViewProduct(null)}
          showToast={showToast}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isWishlisted={wishlistIds.includes(quickViewProduct.id)}
        />
      )}
    </>
  );
};

export default ProductGrid;
