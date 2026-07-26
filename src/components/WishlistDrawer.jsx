import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '../data/products';

const WishlistDrawer = ({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  removeFromWishlist, 
  moveToCart, 
  currency, 
  showToast 
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <Heart size={22} className="gold-text" fill="#D4AF37" />
            <h3 className="drawer-title">YOUR WISHLIST</h3>
            <span className="drawer-badge">{wishlistItems.length}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close wishlist drawer">
            <X size={24} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {wishlistItems.length === 0 ? (
            <div className="empty-cart-state">
              <Heart size={64} className="empty-icon" />
              <h4>Your wishlist is empty</h4>
              <p>Save your favorite items by tapping the heart icon while exploring.</p>
              <button className="btn btn-primary" onClick={onClose}>
                DISCOVER COLLECTION
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {wishlistItems.map((product) => (
                <div key={product.id} className="cart-item">
                  <img src={product.image} alt={product.title} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{product.title}</h4>
                    <p className="cart-item-category">{product.category}</p>
                    <p className="cart-item-price">{formatPrice(product.priceUSD, product.priceRWF, currency)}</p>
                    
                    <div className="wishlist-item-actions flex gap-2" style={{ marginTop: '10px' }}>
                      <button 
                        className="btn btn-gold-sm flex items-center gap-1"
                        onClick={() => {
                          moveToCart(product);
                          if (showToast) showToast(`Moved ${product.title} to cart!`, 'success');
                        }}
                      >
                        <ShoppingBag size={14} /> ADD TO CART
                      </button>

                      <button 
                        className="remove-btn" 
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
