import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content flex flex-col items-center">
        <h1>Timeless Elegance</h1>
        <p>Discover our new arrivals featuring premium fabrics and chic designs for the modern woman.</p>
        <Link to="/new-arrivals" className="btn btn-primary">Shop The Collection</Link>
      </div>
    </section>
  );
};

export default Hero;
