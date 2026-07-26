import React from 'react';
import { Star, Quote } from 'lucide-react';

const pressMentions = [
  { name: "VOGUE", quote: "Aimee Collection bridges African high fashion with global luxury effortlessly." },
  { name: "ELLE", quote: "The Snatched Waist Blazer is an indispensable masterpiece for modern women." },
  { name: "HARPER'S BAZAAR", quote: "Redefining elegance with immaculate tailoring and Italian silk craftsmanship." },
  { name: "L'OFFICIEL", quote: "A rising couture force in East Africa and beyond." }
];

const customerReviews = [
  {
    id: 1,
    name: "Divine U.",
    location: "Kigali, Rwanda",
    role: "Verified Buyer",
    rating: 5,
    comment: "The Classic Noir Jumpsuit fits like a glove! The fabric quality and weight are unmatched. Delivery in Kigali was under 3 hours. Truly top-tier luxury!",
    product: "Classic Noir Jumpsuit"
  },
  {
    id: 2,
    name: "Camille M.",
    location: "Paris, France",
    role: "Verified Buyer",
    rating: 5,
    comment: "I ordered the Luxe Leather Tote to Paris and received it in 3 days. The stitching and gold hardware detail rival top European fashion houses.",
    product: "Luxe Leather Tote"
  },
  {
    id: 3,
    name: "Grace K.",
    location: "London, UK",
    role: "Verified Buyer",
    rating: 5,
    comment: "The Signature Stiletto Heels are surprisingly comfortable for all-day gala events. Worth every single penny!",
    product: "Signature Stiletto Heels"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section section">
      <div className="container">
        
        {/* Press Marquee */}
        <div className="press-marquee-box">
          <span className="press-label">FEATURED IN</span>
          <div className="press-items-flex">
            {pressMentions.map((p, idx) => (
              <div key={idx} className="press-item">
                <span className="press-brand">{p.name}</span>
                <span className="press-quote">"{p.quote}"</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-header-centered" style={{ marginTop: '60px' }}>
          <span className="section-tag">LOVED BY OUR CLIENTELE</span>
          <h2 className="section-title">Client Reviews</h2>
          <div className="section-divider"></div>
        </div>

        <div className="reviews-grid">
          {customerReviews.map((rev) => (
            <div key={rev.id} className="review-card">
              <Quote className="quote-icon" size={32} />
              
              <div className="stars-flex">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#D4AF37" color="#D4AF37" />
                ))}
              </div>

              <p className="review-comment">"{rev.comment}"</p>

              <div className="review-footer">
                <div>
                  <h4 className="reviewer-name">{rev.name}</h4>
                  <span className="reviewer-meta">{rev.location} • {rev.role}</span>
                </div>
                <span className="reviewed-product">{rev.product}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
