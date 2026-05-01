import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ArrowRightLeft } from 'lucide-react';

const QuickViewModal = ({ product, currency, formatPrice, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Small: UK 8-10');

  if (!product) return null;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-left">
          <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'white', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            NEW
          </div>
          <img src={product.image} alt={product.title} className="modal-image" />
          <div style={{ position: 'absolute', bottom: '0', width: '100%', background: 'rgba(219, 180, 180, 0.9)', color: 'white', textAlign: 'center', padding: '10px', fontSize: '0.9rem' }}>
            More Product Info ⓘ
          </div>
        </div>
        
        <div className="modal-right">
          <h2 className="modal-title">{product.title.toUpperCase()}</h2>
          <p className="modal-price">{formatPrice(product.priceUSD, product.priceRWF)}</p>
          
          <div className="size-selector">
            <h4>size</h4>
            <div className="size-options">
              {['Small: UK 8-10', 'Medium: UK 12', 'Large: UK 14-16', 'Xtralarge: UK 18'].map(size => (
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
          
          <div className="action-row">
            <div className="quantity-selector">
              <button className="qty-btn" onClick={handleDecrease}>−</button>
              <input type="text" className="qty-input" value={quantity} readOnly />
              <button className="qty-btn" onClick={handleIncrease}>+</button>
            </div>
            
            <button className="add-cart-btn">
              Add To Cart <ShoppingBag size={18} />
            </button>
          </div>
          
          <div className="wishlist-row">
            <button className="wishlist-btn">
              Add to wishlist <Heart size={18} />
            </button>
            <button className="compare-btn">
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
