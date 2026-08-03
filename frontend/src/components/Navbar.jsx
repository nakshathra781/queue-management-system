import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, LayoutDashboard, Shield, Ticket, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <Ticket size={24} className="logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">Queue<span className="brand-highlight">Flow</span></span>
            <span className="brand-badge">PRO</span>
          </div>
        </Link>

        {isAuthenticated && (
          <>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
              <div className="navbar-links">
                {isCustomer && (
                  <Link
                    to="/dashboard"
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span>My Queue & Tokens</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={18} />
                    <span>Counter Console</span>
                  </Link>
                )}
              </div>

              <div className="navbar-user">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.name}</span>
                    <span className={`role-badge ${user?.role}`}>
                      {user?.role === 'admin' ? `Admin (Counter ${user?.counterNumber || 1})` : 'Customer'}
                    </span>
                  </div>
                </div>

                <button onClick={handleLogout} className="btn btn-logout" title="Sign Out">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="navbar-links auth-actions">
            <Link to="/login" className={`btn btn-secondary ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`btn btn-primary ${isActive('/register') ? 'active' : ''}`}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
