import React, { useState, useEffect } from 'react';

const products = [
  // Clothing
  {
    id: 1,
    title: "Classic Noir Jumpsuit",
    priceUSD: 120,
    priceRWF: 156000,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "Snatched Waist Blazer",
    priceUSD: 145,
    priceRWF: 188500,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    title: "Silk Wrap Dress",
    priceUSD: 165,
    priceRWF: 214500,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&auto=format&fit=crop&q=60"
  },
  
  // Bags
  {
    id: 3,
    title: "Luxe Leather Tote",
    priceUSD: 210,
    priceRWF: 273000,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    title: "Everyday Crossbody",
    priceUSD: 85,
    priceRWF: 110500,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 9,
    title: "Mini Chain Evening Bag",
    priceUSD: 130,
    priceRWF: 169000,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 10,
    title: "Structured Satchel",
    priceUSD: 150,
    priceRWF: 195000,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&auto=format&fit=crop&q=60"
  },

  // Accessories
  {
    id: 7,
    title: "Gold Layered Necklace",
    priceUSD: 95,
    priceRWF: 123500,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 11,
    title: "Classic Silver Watch",
    priceUSD: 120,
    priceRWF: 156000,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 12,
    title: "Diamond Stud Earrings",
    priceUSD: 250,
    priceRWF: 325000,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 13,
    title: "Vintage Sunglasses",
    priceUSD: 65,
    priceRWF: 84500,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=60"
  },

  // Shoes
  {
    id: 4,
    title: "Signature Stiletto Heels",
    priceUSD: 180,
    priceRWF: 234000,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 8,
    title: "Minimalist Block Heels",
    priceUSD: 110,
    priceRWF: 143000,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&auto=format&fit=crop&q=60"
  }
];

const categories = ["All", "Clothing", "Shoes", "Bags", "Accessories"];

const ProductGrid = ({ currency }) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const activeCategory = categories[activeCategoryIndex];

  useEffect(() => {
    let intervalId;
    
    if (!isHovering) {
      intervalId = setInterval(() => {
        setActiveCategoryIndex((prevIndex) => (prevIndex + 1) % categories.length);
      }, 4000); // Change category every 4 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovering]);

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
    <section 
      className="section container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
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
                <button className="btn btn-primary" style={{ width: '100%' }}>Quick View</button>
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
  );
};

export default ProductGrid;
