import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = ({ totalBalance, onEditIncome, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD'
    }).format(amount);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">Expenza</h1>
          <div className="balance-info">
            <span className="balance-label">Total Balance:</span>
            <span className={`balance-amount ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onPageChange('home')}
          >
            Home
          </button>
          <button
            className={`nav-button ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => onPageChange('history')}
          >
            History
          </button>
          <button
            className={`nav-button ${currentPage === 'split' ? 'active' : ''}`}
            onClick={() => onPageChange('split')}
          >
            Split
          </button>
        </nav>

        <div className="header-right">
          <button className="income-button" onClick={onEditIncome}>
            Edit Income
          </button>
          
          <div className="user-menu-container">
            <button 
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{user?.name || 'User'}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="user-menu-items">
                  <button className="menu-item">
                    <span>Profile Settings</span>
                  </button>
                  <button className="menu-item">
                    <span>Account Settings</span>
                  </button>
                  <button className="menu-item">
                    <span>Help & Support</span>
                  </button>
                  <div className="menu-divider"></div>
                  <button className="menu-item logout" onClick={handleLogout}>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="menu-backdrop" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

Header.propTypes = {
  totalBalance: PropTypes.number.isRequired,
  onEditIncome: PropTypes.func.isRequired,
  currentPage: PropTypes.oneOf(['home', 'history', 'split']).isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Header;
