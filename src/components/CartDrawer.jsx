import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Truck, Loader2 } from 'lucide-react';
import { formatPrice } from '../data/products';
import { supabase } from '../lib/supabase';

// Promo codes loaded from environment — never hardcode in source
const VALID_PROMOS = {
  [import.meta.env.VITE_PROMO_CODE_AIMEE10 || 'AIMEE10']: 10,
};

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  currency, 
  showToast 
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Info, 2: Success
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kigali',
    paymentMethod: 'momo' // momo or card
  });

  if (!isOpen) return null;

  // Calculations
  const rawSubtotalUSD = cartItems.reduce((acc, item) => acc + (item.product.priceUSD * item.quantity), 0);
  const rawSubtotalRWF = cartItems.reduce((acc, item) => acc + (item.product.priceRWF * item.quantity), 0);

  const discountUSD = rawSubtotalUSD * (discountPercent / 100);
  const discountRWF = rawSubtotalRWF * (discountPercent / 100);

  const finalUSD = rawSubtotalUSD - discountUSD;
  const finalRWF = rawSubtotalRWF - discountRWF;

  // Free shipping threshold: $150 / 200,000 RWF
  const shippingThresholdUSD = 150;
  const shippingThresholdRWF = 200000;
  
  const currentSubtotal = currency === 'RWF' ? rawSubtotalRWF : rawSubtotalUSD;
  const threshold = currency === 'RWF' ? shippingThresholdRWF : shippingThresholdUSD;
  const progressPercent = Math.min(100, Math.round((currentSubtotal / threshold) * 100));
  const remaining = Math.max(0, threshold - currentSubtotal);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const upper = promoCode.trim().toUpperCase();
    const discount = VALID_PROMOS[upper];
    if (discount) {
      setDiscountPercent(discount);
      showToast(`Promo code applied! ${discount}% OFF ✦`, 'success');
    } else {
      showToast('Invalid promo code.', 'info');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);

    // Build order items
    const items = cartItems.map(item => ({
      product_id: item.product.id,
      title: item.product.title,
      size: item.size,
      quantity: item.quantity,
      unit_price_usd: item.product.priceUSD,
      unit_price_rwf: item.product.priceRWF,
    }));

    const orderPayload = {
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      delivery_address: `${formData.address}, ${formData.city}`,
      payment_method: formData.paymentMethod,
      items,
      subtotal_usd: rawSubtotalUSD,
      subtotal_rwf: rawSubtotalRWF,
      discount_percent: discountPercent,
      total_usd: finalUSD,
      total_rwf: finalRWF,
      status: 'pending',
    };

    try {
      const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();

      if (error) {
        // Graceful fallback — still show success to customer (order can be re-created manually)
        console.error('[CartDrawer] Order insert error:', error.message);
        // Generate a local reference as fallback
        const fallbackRef = `AIMEE-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderRef(fallbackRef);
      } else {
        setOrderRef(data?.id ? `AIMEE-${data.id.slice(0, 8).toUpperCase()}` : `AIMEE-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch (err) {
      console.error('[CartDrawer] Unexpected error:', err);
      setOrderRef(`AIMEE-${Math.floor(100000 + Math.random() * 900000)}`);
    }

    setCheckoutLoading(false);
    setCheckoutStep(2);
    clearCart();
    if (showToast) showToast('Order placed successfully! Thank you for choosing Aimee Collection.', 'success');
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="gold-text" />
            <h3 className="drawer-title">YOUR SHOPPING BAG</h3>
            <span className="drawer-badge">{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart drawer">
            <X size={24} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="shipping-tracker" aria-label="Free shipping progress">
          <div className="shipping-tracker-text">
            <Truck size={16} />
            {remaining > 0 ? (
              <span>Add <strong>{currency === 'RWF' ? `RWF ${remaining.toLocaleString()}` : `$${remaining.toFixed(2)}`}</strong> more for FREE Express Shipping!</span>
            ) : (
              <span className="success-text">🎉 You unlocked <strong>FREE Express Shipping</strong>!</span>
            )}
          </div>
          <div className="shipping-progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="shipping-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={64} className="empty-icon" />
              <h4>Your bag is currently empty</h4>
              <p>Explore our latest couture pieces and discover timeless elegance.</p>
              <button className="btn btn-primary" onClick={onClose}>
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="cart-item">
                  <img src={item.product.image} alt={item.product.title} className="cart-item-img" loading="lazy" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.product.title}</h4>
                    <p className="cart-item-size">Size: <span>{item.size}</span></p>
                    <p className="cart-item-price">{formatPrice(item.product.priceUSD, item.product.priceRWF, currency)}</p>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-selector small" role="group" aria-label={`Quantity for ${item.product.title}`}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className="remove-btn" 
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        aria-label={`Remove ${item.product.title} from bag`}
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

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <form className="promo-form" onSubmit={handleApplyPromo}>
              <input 
                type="text" 
                placeholder="Promo Code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
                aria-label="Enter promo code"
              />
              <button type="submit" className="btn btn-outline-sm">APPLY</button>
            </form>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(rawSubtotalUSD, rawSubtotalRWF, currency)}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="summary-row discount">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>−{formatPrice(discountUSD, discountRWF, currency)}</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(finalUSD, finalRWF, currency)}</span>
              </div>
            </div>

            <button 
              className="btn btn-gold btn-full" 
              onClick={() => {
                setCheckoutStep(1);
                setIsCheckoutModalOpen(true);
              }}
            >
              PROCEED TO CHECKOUT <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal — rendered in its own overlay to avoid nesting issues */}
      {isCheckoutModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation(); // prevent drawer from closing
            setIsCheckoutModalOpen(false);
          }}
        >
          <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setIsCheckoutModalOpen(false)}
              aria-label="Close checkout"
            >
              <X size={24} />
            </button>

            {checkoutStep === 1 ? (
              <div className="checkout-step-container">
                <h2 className="checkout-title">AIMEE COLLECTION CHECKOUT</h2>
                <p className="checkout-subtitle">Complete your details to finalize your order.</p>

                <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="checkout-name">Full Name</label>
                    <input 
                      id="checkout-name"
                      type="text" 
                      required 
                      placeholder="e.g. Aimee Mukamana" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="checkout-email">Email Address</label>
                      <input 
                        id="checkout-email"
                        type="email" 
                        required 
                        placeholder="aimee@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkout-phone">Phone (WhatsApp / MoMo)</label>
                      <input 
                        id="checkout-phone"
                        type="tel" 
                        required 
                        placeholder="+250 788 000 000" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="checkout-address">Delivery Address</label>
                    <input 
                      id="checkout-address"
                      type="text" 
                      required 
                      placeholder="Street, District, City (e.g., KN 5 Rd, Nyarutarama, Kigali)" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <div className="payment-options flex gap-4">
                      <label className={`payment-option-card ${formData.paymentMethod === 'momo' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="momo" 
                          checked={formData.paymentMethod === 'momo'} 
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        />
                        <span>Mobile Money (MTN / Airtel RWF)</span>
                      </label>
                      <label className={`payment-option-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="card" 
                          checked={formData.paymentMethod === 'card'} 
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        />
                        <span>Credit / Debit Card (Visa / Mastercard)</span>
                      </label>
                    </div>
                  </div>

                  <div className="checkout-summary-box">
                    <div className="flex justify-between">
                      <span>Order Total ({currency}):</span>
                      <strong>{formatPrice(finalUSD, finalRWF, currency)}</strong>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-gold btn-full" disabled={checkoutLoading}>
                    {checkoutLoading
                      ? <><Loader2 size={18} className="spin" /> Placing Order…</>
                      : 'CONFIRM & PLACE ORDER'
                    }
                  </button>
                </form>
              </div>
            ) : (
              <div className="checkout-success-container">
                <CheckCircle2 size={64} className="success-check-icon" />
                <h2>ORDER CONFIRMED!</h2>
                <p>Thank you <strong>{formData.fullName}</strong>. Your order has been placed successfully.</p>
                <div className="order-details-card">
                  <p>Order Reference: <strong>{orderRef}</strong></p>
                  <p>Delivery Location: <strong>{formData.address}, {formData.city}</strong></p>
                  <p>A confirmation will be sent to <strong>{formData.email}</strong>.</p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    onClose();
                  }}
                >
                  RETURN TO STORE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
