import React from 'react';

const products = [
  {
    id: 1,
    title: "Classic Noir Jumpsuit",
    priceUSD: 120,
    priceRWF: 156000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "Snatched Waist Blazer",
    priceUSD: 145,
    priceRWF: 188500,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "Luxe Leather Tote",
    priceUSD: 210,
    priceRWF: 273000,
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    title: "Signature Stiletto Heels",
    priceUSD: 180,
    priceRWF: 234000,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    title: "Silk Wrap Dress",
    priceUSD: 165,
    priceRWF: 214500,
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    title: "Everyday Crossbody",
    priceUSD: 85,
    priceRWF: 110500,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 7,
    title: "Chunky Knit Sweater",
    priceUSD: 95,
    priceRWF: 123500,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 8,
    title: "Minimalist Block Heels",
    priceUSD: 110,
    priceRWF: 143000,
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&auto=format&fit=crop&q=60"
  }
];

const ProductGrid = ({ currency }) => {
  const formatPrice = (usd, rwf) => {
    if (currency === 'RWF') {
      return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(rwf);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
  };

  return (
    <section className="section container">
      <h2 className="section-title">Trending Now</h2>
      <div className="product-grid">
        {products.map((product) => (
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
