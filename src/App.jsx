import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { formatPrice } from './data/products';
import { AuthProvider, useAuth } from './context/AuthContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryBanners from './components/CategoryBanners';
import ProductGrid from './components/ProductGrid';
import BestSellersSlider from './components/BestSellersSlider';
import BrandStory from './components/BrandStory';
import Testimonials from './components/Testimonials';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import SearchModal from './components/SearchModal';
import QuickViewModal from './components/QuickViewModal';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';

// Reusable Toast component for feedback
const Toast = ({ message, type, visible }) => (
  <div
    className={`toast ${type} ${visible ? 'show' : ''}`}
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {message}
  </div>
);

// Luxury Sub-page Header Banner
const SubpageBanner = ({ title, category, description, bgImage }) => (
  <div
    className="subpage-banner"
    style={{ backgroundImage: `linear-gradient(rgba(13,13,13,0.7), rgba(13,13,13,0.85)), url(${bgImage})` }}
  >
    <div className="container subpage-banner-content">
      <div className="breadcrumbs">
        <Link to="/">HOME</Link> <span>/</span> <span className="current">{title.toUpperCase()}</span>
      </div>
      <h1 className="subpage-title">{title}</h1>
      <p className="subpage-description">{description}</p>
    </div>
  </div>
);

// Subpage view wrapper
const CategoryPage = ({
  title,
  category,
  description,
  bgImage,
  currency,
  showToast,
  wishlistIds,
  toggleWishlist,
  addToCart
}) => (
  <div className="category-page">
    <SubpageBanner title={title} category={category} description={description} bgImage={bgImage} />
    <BestSellersSlider
      currency={currency}
      showToast={showToast}
      category={category}
      wishlistIds={wishlistIds}
      toggleWishlist={toggleWishlist}
      addToCart={addToCart}
    />
    <ProductGrid
      currency={currency}
      initialCategory={category}
      showToast={showToast}
      wishlistIds={wishlistIds}
      toggleWishlist={toggleWishlist}
      addToCart={addToCart}
    />
  </div>
);

// Protected Admin Route
const ProtectedAdminRoute = ({ children }) => {
  const { user, isStaff, loading } = useAuth();
  if (loading) return <div className="admin-loading"><p>Loading...</p></div>;
  if (!user || !isStaff) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const [currency, setCurrency] = useState('RWF');
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aimee_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aimee_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedSearchProduct, setSelectedSearchProduct] = useState(null);

  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Save cart & wishlist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aimee_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('aimee_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistItems]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // Cart operations
  const addToCart = useCallback((product, size = 'Small: UK 8-10', quantity = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.size === size);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, size, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId, size, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
    } else {
      setCartItems(prev => prev.map(item => {
        if (item.product.id === productId && item.size === size) {
          return { ...item, quantity: newQty };
        }
        return item;
      }));
    }
  }, []);

  const removeFromCart = useCallback((productId, size) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Wishlist operations
  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast(`Removed ${product.title} from wishlist`, 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast(`Saved ${product.title} to wishlist ❤️`, 'success');
        return [...prev, product];
      }
    });
  }, [showToast]);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const moveToCart = useCallback((product) => {
    addToCart(product, 'Small: UK 8-10', 1);
    removeFromWishlist(product.id);
  }, [addToCart, removeFromWishlist]);

  const wishlistIds = wishlistItems.map(item => item.id);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="app">
        <AnnouncementBar />

        <Navbar
          currency={currency}
          setCurrency={setCurrency}
          cartCount={cartCount}
          wishlistCount={wishlistItems.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <CategoryBanners />
              <BestSellersSlider
                currency={currency}
                showToast={showToast}
                wishlistIds={wishlistIds}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
              />
              <ProductGrid
                currency={currency}
                showToast={showToast}
                wishlistIds={wishlistIds}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
              />
              <BrandStory />
              <Testimonials />
            </>
          } />

          <Route path="/new-arrivals" element={
            <CategoryPage
              title="New Season Arrivals"
              category="All"
              description="Discover the newest haute couture drops, fresh runway silhouettes, and limited edition releases."
              bgImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
              currency={currency}
              showToast={showToast}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
            />
          } />

          <Route path="/clothing" element={
            <CategoryPage
              title="Clothing Collection"
              category="Clothing"
              description="Architectural blazers, silk wrap dresses, and sculpting jumpers tailored for uncompromised authority."
              bgImage="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80"
              currency={currency}
              showToast={showToast}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
            />
          } />

          <Route path="/shoes" element={
            <CategoryPage
              title="Signature Footwear"
              category="Shoes"
              description="Pointed stiletto heels, comfortable block mules, and Italian suede boots handcrafted with precision."
              bgImage="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80"
              currency={currency}
              showToast={showToast}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
            />
          } />

          <Route path="/bags" element={
            <CategoryPage
              title="Luxury Italian Leather Bags"
              category="Bags"
              description="Full-grain leather totes, quilted evening chain bags, and structured satchels with polished gold hardware."
              bgImage="https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=1600&q=80"
              currency={currency}
              showToast={showToast}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
            />
          } />

          <Route path="/accessories" element={
            <CategoryPage
              title="High Jewelry & Accessories"
              category="Accessories"
              description="18k gold vermeil layered necklaces, diamond solitaire studs, silk twill scarves, and cat-eye eyewear."
              bgImage="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1600&q=80"
              currency={currency}
              showToast={showToast}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
            />
          } />

          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />

          {/* Reset password redirect route */}
          <Route path="/reset-password" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer showToast={showToast} />

        {/* Global Drawers & Modals */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          currency={currency}
          showToast={showToast}
        />

        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistItems={wishlistItems}
          removeFromWishlist={removeFromWishlist}
          moveToCart={moveToCart}
          currency={currency}
          showToast={showToast}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(prod) => setSelectedSearchProduct(prod)}
          currency={currency}
        />

        {selectedSearchProduct && (
          <QuickViewModal
            product={selectedSearchProduct}
            currency={currency}
            formatPrice={(usd, rwf) => formatPrice(usd, rwf, currency)}
            onClose={() => setSelectedSearchProduct(null)}
            showToast={showToast}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            isWishlisted={wishlistIds.includes(selectedSearchProduct.id)}
          />
        )}

        <Toast message={toast.message} type={toast.type} visible={toast.visible} />

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
