import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "ELEGANCE REDEFINED",
    subtitle: "AUTUMN / WINTER 2026 COLLECTION",
    description: "Immerse yourself in refined silhouettes, bespoke craftsmanship, and timeless luxury designed for the modern muse.",
    bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85",
    buttonText: "SHOP NEW SEASON",
    buttonLink: "/new-arrivals"
  },
  {
    id: 2,
    title: "HAUTE HANDBAGS & LEATHER",
    subtitle: "THE LUXURY ACCESSORY EDIT",
    description: "Handcrafted full-grain Italian leather, polished gold hardware, and architectural elegance for every occasion.",
    bgImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1600&q=85",
    buttonText: "EXPLORE BAGS",
    buttonLink: "/bags"
  },
  {
    id: 3,
    title: "SIGNATURE FOOTWEAR",
    subtitle: "PERFECT BALANCE OF ART & COMFORT",
    description: "Step into uncompromised confidence with our signature stiletto pumps, block heels, and artisanal suede boots.",
    bgImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=85",
    buttonText: "DISCOVER SHOES",
    buttonLink: "/shoes"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="hero-section">
      {slides.map((s, idx) => (
        <div 
          key={s.id} 
          className={`hero-bg-slide ${idx === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(to right, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.4) 60%, rgba(13,13,13,0.2) 100%), url(${s.bgImage})` }}
        />
      ))}

      <div className="container hero-container">
        <div className="hero-content-box">
          <div className="hero-badge">
            <Sparkles size={14} className="gold-icon" />
            <span>AIMEE COLLECTION HAUTE COUTURE</span>
          </div>

          <h1 className="hero-headline">{slide.title}</h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          <p className="hero-description">{slide.description}</p>

          <div className="hero-cta-group">
            <Link to={slide.buttonLink} className="btn btn-gold">
              {slide.buttonText} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/clothing" className="btn btn-outline-white">
              EXPLORE LOOKBOOK
            </Link>
          </div>

          <div className="hero-features-bar">
            <div className="hero-feature-item">
              <ShieldCheck size={16} /> <span>100% Handcrafted Luxury</span>
            </div>
            <div className="hero-feature-item">
              <Truck size={16} /> <span>Express Delivery in Kigali & Global Shipping</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-indicators">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            className={`hero-indicator ${idx === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
