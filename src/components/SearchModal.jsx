import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { products, formatPrice } from '../data/products';

const popularSearches = ["Blazer", "Jumpsuit", "Leather Tote", "Silk Dress", "Stiletto", "Gold Necklace"];

const SearchModal = ({ isOpen, onClose, onSelectProduct, currency }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults = query.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <Search size={22} className="search-icon" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search by product, category, style, or material..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-modal-input"
            />
            {query && (
              <button className="clear-query-btn" onClick={() => setQuery('')}>
                <X size={18} />
              </button>
            )}
          </div>
          <button className="icon-btn search-close-btn" onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        <div className="search-modal-body">
          {query.trim() === '' ? (
            <div className="popular-searches-box">
              <h4>POPULAR SEARCHES</h4>
              <div className="popular-tags-flex">
                {popularSearches.map(tag => (
                  <button 
                    key={tag} 
                    className="popular-tag-btn"
                    onClick={() => setQuery(tag)}
                  >
                    {tag} <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="search-results-container">
              <p className="results-count-text">
                Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
              </p>

              {filteredResults.length === 0 ? (
                <div className="no-results-state">
                  <p>No products found matching your search. Try searching for "Blazer", "Silk", or "Bags".</p>
                </div>
              ) : (
                <div className="search-results-grid">
                  {filteredResults.map((product) => (
                    <div 
                      key={product.id} 
                      className="search-result-card"
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                    >
                      <img src={product.image} alt={product.title} className="search-result-img" />
                      <div className="search-result-info">
                        <span className="search-result-cat">{product.category}</span>
                        <h4 className="search-result-title">{product.title}</h4>
                        <p className="search-result-price">{formatPrice(product.priceUSD, product.priceRWF, currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
