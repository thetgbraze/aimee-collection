import React from 'react';
import { Award, Gem, Feather, Sparkles } from 'lucide-react';

const BrandStory = () => {
  return (
    <section className="brand-story-section">
      <div className="container brand-story-grid">
        <div className="brand-story-image-box">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80" 
            alt="Aimee Collection Fashion Atelier" 
            className="brand-story-img main"
          />
          <div className="brand-story-floating-badge">
            <Sparkles className="gold-text" size={24} />
            <div>
              <strong>KIGALI & PARIS</strong>
              <span>Designed with Haute Couture Mastery</span>
            </div>
          </div>
        </div>

        <div className="brand-story-content">
          <span className="section-tag">OUR HERITAGE</span>
          <h2 className="brand-story-title">Crafting Unapologetic Elegance Since 2020</h2>
          <p className="brand-story-text">
            Aimee Collection was founded with a singular vision: to empower modern women through architectural silhouettes, exquisite Italian textiles, and uncompromised craftsmanship. 
          </p>
          <p className="brand-story-text">
            Every garment, handbag, and jewel in our collection undergoes rigorous artisanal construction, blending timeless African grace with global luxury standards.
          </p>

          <div className="brand-pillars-grid">
            <div className="pillar-item">
              <Gem size={28} className="gold-text" />
              <div>
                <h4>Artisanal Integrity</h4>
                <p>Hand-finished tailoring and premium full-grain materials.</p>
              </div>
            </div>

            <div className="pillar-item">
              <Feather size={28} className="gold-text" />
              <div>
                <h4>Sustainable Luxury</h4>
                <p>Ethically sourced fabrics and low-waste production lines.</p>
              </div>
            </div>

            <div className="pillar-item">
              <Award size={28} className="gold-text" />
              <div>
                <h4>Award-Winning Fit</h4>
                <p>Engineered to sculpt, elevate, and inspire confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
