import React, { useState, useEffect, useRef } from 'react';
import QuickViewModal from './QuickViewModal';

const products = [
  // Clothing
  { id: 1, title: "Classic Noir Jumpsuit", priceUSD: 120, priceRWF: 156000, category: "Clothing", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=60" },
  { id: 2, title: "Snatched Waist Blazer", priceUSD: 145, priceRWF: 188500, category: "Clothing", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=60" },
  { id: 3, title: "Silk Wrap Dress", priceUSD: 165, priceRWF: 214500, category: "Clothing", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=60" },
  { id: 4, title: "Ribbed Knit Midi", priceUSD: 95, priceRWF: 123500, category: "Clothing", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=60" },
  { id: 5, title: "High-Waist Trousers", priceUSD: 110, priceRWF: 143000, category: "Clothing", image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=60" },
  { id: 6, title: "Velvet Evening Gown", priceUSD: 250, priceRWF: 325000, category: "Clothing", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=60" },
  
  // Bags
  { id: 7, title: "Luxe Leather Tote", priceUSD: 210, priceRWF: 273000, category: "Bags", image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=60" },
  { id: 8, title: "Everyday Crossbody", priceUSD: 85, priceRWF: 110500, category: "Bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=60" },
  { id: 9, title: "Mini Chain Evening Bag", priceUSD: 130, priceRWF: 169000, category: "Bags", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=60" },
  { id: 10, title: "Structured Satchel", priceUSD: 150, priceRWF: 195000, category: "Bags", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&q=60" },
  { id: 11, title: "Canvas Weekend Bag", priceUSD: 175, priceRWF: 227500, category: "Bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=60" },
  { id: 12, title: "Woven Summer Clutch", priceUSD: 65, priceRWF: 84500, category: "Bags", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=60" },

  // Accessories
  { id: 13, title: "Gold Layered Necklace", priceUSD: 95, priceRWF: 123500, category: "Accessories", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=60" },
  { id: 14, title: "Classic Silver Watch", priceUSD: 120, priceRWF: 156000, category: "Accessories", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=60" },
  { id: 15, title: "Diamond Stud Earrings", priceUSD: 250, priceRWF: 325000, category: "Accessories", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=60" },
  { id: 16, title: "Vintage Sunglasses", priceUSD: 65, priceRWF: 84500, category: "Accessories", image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=60" },
  { id: 17, title: "Silk Hair Scarf", priceUSD: 45, priceRWF: 58500, category: "Accessories", image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=60" },
  { id: 18, title: "Pearl Drop Earrings", priceUSD: 110, priceRWF: 143000, category: "Accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=60" },

  // Shoes
  { id: 19, title: "Signature Stiletto Heels", priceUSD: 180, priceRWF: 234000, category: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=60" },
  { id: 20, title: "Minimalist Block Heels", priceUSD: 110, priceRWF: 143000, category: "Shoes", image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=60" },
  { id: 21, title: "Strappy Sandal Heels", priceUSD: 135, priceRWF: 175500, category: "Shoes", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=60" },
  { id: 22, title: "Suede Ankle Boots", priceUSD: 210, priceRWF: 273000, category: "Shoes", image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=60" },
  { id: 23, title: "Pointed Toe Mules", priceUSD: 125, priceRWF: 162500, category: "Shoes", image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=60" },
  { id: 24, title: "Platform Loafers", priceUSD: 145, priceRWF: 188500, category: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=60" }
];

const categories = ["All", "Clothing", "Shoes", "Bags", "Accessories"];

const ProductGrid = ({ currency }) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const pauseTimeoutRef = useRef(null);

  const activeCategory = categories[activeCategoryIndex];

  // Auto-slide interval
  useEffect(() => {
    let intervalId;
    if (!isPaused && !quickViewProduct) {
      intervalId = setInterval(() => {
        setActiveCategoryIndex((prevIndex) => (prevIndex + 1) % categories.length);
      }, 4000); // Change category every 4 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaused, quickViewProduct]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  const handleInteraction = () => {
    if (quickViewProduct) return;
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    // Resume auto-sliding after 4 seconds of inactivity
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  const handleMouseLeave = () => {
    if (quickViewProduct) return;
    // If they leave the section entirely, resume immediately
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    setIsPaused(false);
  };

  const formatPrice = (usd, rwf) => {
    if (currency === 'RWF') {
      return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(rwf);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
  };

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <>
      <section 
        className="section container"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
        onMouseEnter={handleInteraction}
        onMouseLeave={handleMouseLeave}
      >
        <h2 className="section-title">New Arrivals</h2>
        
        <div className="category-tabs">
          {categories.map((category, index) => (
            <button 
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategoryIndex(index)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
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
                <p className="product-price">{formatPrice(product.priceUSD, product.priceRWF)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          currency={currency} 
          formatPrice={formatPrice} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </>
  );
};

export default ProductGrid;
