import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    name: 'Clothing Collection',
    category: 'Clothing',
    itemCount: '6 Exclusive Designs',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    link: '/clothing',
    size: 'large'
  },
  {
    name: 'Luxury Handbags',
    category: 'Bags',
    itemCount: '6 Italian Leather Models',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80',
    link: '/bags',
    size: 'medium'
  },
  {
    name: 'Artisanal Footwear',
    category: 'Shoes',
    itemCount: '6 Signature Heels & Boots',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    link: '/shoes',
    size: 'medium'
  },
  {
    name: 'High Jewelry & Accessories',
    category: 'Accessories',
    itemCount: '6 Gold & Diamond Pieces',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80',
    link: '/accessories',
    size: 'large'
  }
];

const CategoryBanners = () => {
  return (
    <section className="section container">
      <div className="section-header-centered">
        <span className="section-tag">CURATED SELECTION</span>
        <h2 className="section-title">Shop By Category</h2>
        <div className="section-divider"></div>
      </div>

      <div className="category-banners-grid">
        {categories.map((cat) => (
          <Link key={cat.category} to={cat.link} className={`category-banner-card ${cat.size}`}>
            <div 
              className="category-banner-bg" 
              style={{ backgroundImage: `url(${cat.image})` }}
            />
            <div className="category-banner-overlay" />
            <div className="category-banner-content">
              <span className="category-banner-count">{cat.itemCount}</span>
              <h3 className="category-banner-title">{cat.name}</h3>
              <div className="category-banner-cta">
                <span>EXPLORE CATEGORY</span>
                <ArrowUpRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryBanners;
