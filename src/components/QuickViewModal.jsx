import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Heart, ArrowRightLeft } from 'lucide-react';

const MAX_QUANTITY = 99;

const QuickViewModal = ({ product, currency, formatPrice, onClose, showToast }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Small: UK 8-10');
  const modalRef = useRef(null);

  // Trap focus inside modal and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the modal on open
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < MAX_QUANTITY) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (showToast) {
      showToast(`Added ${quantity}× ${product.title} (${selectedSize}) to cart!`, 'success');
    }
  };

  const handleAddToWishlist = () => {
    if (showToast) {
      showToast(`${product.title} added to wishlist ❤️`, 'success');
    }
  };

  const handleCompare = () => {
    if (showToast) {
      showToast(`${product.title} added to comparison`, 'info');
    }
  };

  const sizes = ['Small: UK 8-10', 'Medium: UK 12', 'Large: UK 14-16', 'Xtralarge: UK 18'];

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
        
        <div className="modal-left">
          <div className="modal-badge">NEW</div>
          <img src={product.image} alt={product.title} className="modal-image" />
          <div className="modal-info-bar">
            More Product Info ⓘ
          </div>
        </div>
        
        <div className="modal-right">
          <h2 className="modal-title">{product.title.toUpperCase()}</h2>
          <p className="modal-price">{formatPrice(product.priceUSD, product.priceRWF)}</p>
          
          <div className="size-selector">
            <h4>size</h4>
            <div className="size-options">
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
          
          <div className="action-row">
            <div className="quantity-selector">
              <button 
                className="qty-btn" 
                onClick={handleDecrease}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                −
              </button>
              <input 
                type="text" 
                className="qty-input" 
                value={quantity} 
                readOnly 
                aria-label={`Quantity: ${quantity}`}
              />
              <button 
                className="qty-btn" 
                onClick={handleIncrease}
                aria-label="Increase quantity"
                disabled={quantity >= MAX_QUANTITY}
              >
                +
              </button>
            </div>
            
            <button className="add-cart-btn" onClick={handleAddToCart}>
              Add To Cart <ShoppingBag size={18} />
            </button>
          </div>
          
          <div className="wishlist-row">
            <button className="wishlist-btn" onClick={handleAddToWishlist}>
              Add to wishlist <Heart size={18} />
            </button>
            <button className="compare-btn" onClick={handleCompare} aria-label="Compare product">
              <ArrowRightLeft size={18} />
            </button>
          </div>
          
          <div className="modal-meta">
            <p>SKU: <span>N/A</span></p>
            <p>Categories: <span>drop 10, New In, {product.category.toLowerCase()}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
