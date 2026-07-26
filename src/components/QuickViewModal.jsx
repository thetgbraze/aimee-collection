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
            <div className={`modal-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
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
            <div className="size-options">
              {sizes.map(size => (
                <button 
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quantity & Add to Cart Action Row */}
          <div className="action-row">
            <div className="quantity-selector">
              <button 
                className="qty-btn" 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input type="text" className="qty-input" value={quantity} readOnly />
              <button 
                className="qty-btn" 
                onClick={() => quantity < MAX_QUANTITY && setQuantity(quantity + 1)}
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
            >
              <Heart size={20} fill={isWishlisted ? '#D4AF37' : 'none'} color={isWishlisted ? '#D4AF37' : '#111111'} />
            </button>
          </div>
          
          {/* Accordion Tabs */}
          <div className="modal-tabs">
            <div className="tab-headers">
              <button className={`tab-header-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
              <button className={`tab-header-btn ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>Shipping</button>
              <button className={`tab-header-btn ${activeTab === 'care' ? 'active' : ''}`} onClick={() => setActiveTab('care')}>Care</button>
            </div>
            <div className="tab-content">
              {activeTab === 'details' && (
                <ul>
                  <li>• Handcrafted from 100% premium Italian textiles</li>
                  <li>• Signature gold-plated hardware embellishments</li>
                  <li>• Tailored fit designed to contour gracefully</li>
                </ul>
              )}
              {activeTab === 'shipping' && (
                <div>
                  <p><Truck size={14} inline /> Same-day express dispatch in Kigali. International shipping via DHL (2-4 business days).</p>
                  <p><RotateCcw size={14} inline /> Complimentary 14-day hassle-free returns & exchanges.</p>
                </div>
              )}
              {activeTab === 'care' && (
                <p>Dry clean only. Store in original Aimee Collection dust bag to preserve fabric luster.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      {isSizeGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="modal-content size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSizeGuideOpen(false)}><X size={20} /></button>
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
