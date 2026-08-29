import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Heart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const MAX_QUANTITY = 99;

const QuickViewModal = ({ 
  product, 
  currency, 
  formatPrice, 
  onClose, 
  showToast,
  addToCart,
  toggleWishlist,
  isWishlisted 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Small: UK 8-10');
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [activeTab, setActiveTab] = useState('details'); // details, shipping, care
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    if (modalRef.current) modalRef.current.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (addToCart) {
      addToCart(product, selectedSize, quantity);
    }
    if (showToast) {
      showToast(`Added ${quantity}× ${product.title} (${selectedSize}) to bag!`, 'success');
    }
    onClose();
  };

  const sizes = ['Small: UK 8-10', 'Medium: UK 12', 'Large: UK 14-16', 'Xtralarge: UK 18'];
  const galleryImages = [product.image, product.secondaryImage].filter(Boolean);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.title}`}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close quick view">
          <X size={24} />
        </button>
        
        {/* Left Side: Image Gallery */}
        <div className="modal-left">
          {product.badge && (
            <div className={`modal-badge ${product.badge.toLowerCase().replaceAll(' ', '-')}`}>
              {product.badge}
            </div>
          )}

          <img src={selectedImage} alt={product.title} className="modal-image" />
          
          {galleryImages.length > 1 && (
            <div className="modal-gallery-thumbs">
              {galleryImages.map((img, i) => (
                <button 
                  key={i} 
                  className={`gallery-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                  aria-label={i === 0 ? 'Primary product view' : 'Lifestyle view'}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Side: Product Details & Purchase Actions */}
        <div className="modal-right">
          <div className="flex justify-between items-center">
            <span className="modal-category-text">{product.category}</span>
            <div className="stars-flex">
              <Star size={14} fill="#D4AF37" color="#D4AF37" />
              <span className="rating-score">{product.rating}</span>
              <span className="reviews-count">({product.reviewsCount} reviews)</span>
            </div>
          </div>

          <h2 className="modal-title">{product.title.toUpperCase()}</h2>
          <p className="modal-price">{formatPrice(product.priceUSD, product.priceRWF)}</p>

          <p className="modal-short-desc">{product.description}</p>
          
          {/* Stock Availability Indicator */}
          {product.inStock && (
            <div className="stock-status-box">
              <span className="stock-dot pulse"></span>
              <span>In Stock — Only <strong>{product.inStock} left</strong> at Kigali Atelier</span>
            </div>
          )}

          {/* Size Selector */}
          <div className="size-selector">
            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
              <h4>SELECT SIZE</h4>
              <button 
                type="button" 
                className="size-guide-link"
                onClick={() => setIsSizeGuideOpen(true)}
              >
                Size Guide 📏
              </button>
            </div>
            <div className="size-options" role="group" aria-label="Select size">
              {sizes.map(size => (
                <button 
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quantity & Add to Cart Action Row */}
          <div className="action-row">
            <div className="quantity-selector" role="group" aria-label="Quantity">
              <button 
                className="qty-btn" 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                className="qty-input"
                value={quantity}
                readOnly
                min={1}
                max={MAX_QUANTITY}
                aria-label={`Quantity: ${quantity}`}
              />
              <button 
                className="qty-btn" 
                onClick={() => quantity < MAX_QUANTITY && setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                disabled={quantity >= MAX_QUANTITY}
              >
                +
              </button>
            </div>
            
            <button className="add-cart-btn btn-gold" onClick={handleAddToCart}>
              ADD TO BAG <ShoppingBag size={18} />
            </button>

            <button 
              className={`wishlist-btn-icon ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              aria-pressed={isWishlisted}
            >
              <Heart size={20} fill={isWishlisted ? '#D4AF37' : 'none'} color={isWishlisted ? '#D4AF37' : '#111111'} />
            </button>
          </div>
          
          {/* Accordion Tabs */}
          <div className="modal-tabs">
            <div className="tab-headers" role="tablist">
              <button
                className={`tab-header-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
                role="tab"
                aria-selected={activeTab === 'details'}
              >
                Details
              </button>
              <button
                className={`tab-header-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
                role="tab"
                aria-selected={activeTab === 'shipping'}
              >
                Shipping
              </button>
              <button
                className={`tab-header-btn ${activeTab === 'care' ? 'active' : ''}`}
                onClick={() => setActiveTab('care')}
                role="tab"
                aria-selected={activeTab === 'care'}
              >
                Care
              </button>
            </div>
            <div className="tab-content" role="tabpanel">
              {activeTab === 'details' && (
                <ul>
                  <li>• Handcrafted from 100% premium Italian textiles</li>
                  <li>• Signature gold-plated hardware embellishments</li>
                  <li>• Tailored fit designed to contour gracefully</li>
                </ul>
              )}
              {activeTab === 'shipping' && (
                <div>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Truck size={14} />
                    Same-day express dispatch in Kigali. International shipping via DHL (2–4 business days).
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RotateCcw size={14} />
                    Complimentary 14-day hassle-free returns &amp; exchanges.
                  </p>
                </div>
              )}
              {activeTab === 'care' && (
                <p>Dry clean only. Store in original Aimee Collection dust bag to preserve fabric luster.</p>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-gold)' }} /> Authentic Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      {isSizeGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeGuideOpen(false)} role="dialog" aria-modal="true" aria-label="Size guide">
          <div className="modal-content size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSizeGuideOpen(false)} aria-label="Close size guide"><X size={20} /></button>
            <h3>AIMEE COLLECTION SIZE GUIDE</h3>
            <table className="size-guide-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>UK/AU</th>
                  <th>US</th>
                  <th>Bust (in)</th>
                  <th>Waist (in)</th>
                  <th>Hips (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Small</td><td>8 - 10</td><td>4 - 6</td><td>33-35</td><td>26-28</td><td>36-38</td></tr>
                <tr><td>Medium</td><td>12</td><td>8</td><td>36-38</td><td>29-31</td><td>39-41</td></tr>
                <tr><td>Large</td><td>14 - 16</td><td>10 - 12</td><td>39-41</td><td>32-34</td><td>42-44</td></tr>
                <tr><td>Xtralarge</td><td>18</td><td>14</td><td>42-44</td><td>35-37</td><td>45-47</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickViewModal;
