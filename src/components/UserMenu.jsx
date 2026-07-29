import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Shield, Store, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserMenu = ({ onOpenAuth }) => {
  const { user, profile, signOut, isStaff, isAdmin, isStoreManager } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <button
        className="icon-btn"
        aria-label="Sign in"
        onClick={onOpenAuth}
        title="Sign In / Create Account"
      >
        <User size={20} />
      </button>
    );
  }

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Account menu"
      >
        <div className="user-menu-avatar">
          {profile?.first_name?.[0] || user.email[0].toUpperCase()}
        </div>
        <ChevronDown size={14} className={`user-menu-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <span className="user-menu-name">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : user.email}
            </span>
            <span className="user-menu-email">{user.email}</span>
            {isStaff && (
              <span className={`user-menu-role-badge ${profile?.role}`}>
                {isAdmin ? <><Shield size={11} /> Admin</> : <><Store size={11} /> Manager</>}
              </span>
            )}
          </div>

          <div className="user-menu-divider"></div>

          {isStaff && (
            <Link
              to="/admin"
              className="user-menu-item"
              onClick={() => setIsOpen(false)}
            >
              <Shield size={16} />
              Dashboard
            </Link>
          )}

          <button
            className="user-menu-item logout"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
