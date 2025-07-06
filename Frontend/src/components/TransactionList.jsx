import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/TransactionList.css';

const TransactionList = ({ 
  transactions = [], 
  onDelete = () => {}, 
  onClearAll = () => {}, 
  error = null, 
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all transactions?')) {
      onClearAll();
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount || 0));

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.category?.toLowerCase().includes(searchLower)
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'amount':
        return ((a.amount || 0) - (b.amount || 0)) * order;
      case 'date':
        return (new Date(a.timestamp || a.date || 0) - new Date(b.timestamp || b.date || 0)) * order;
      default:
        return (a.description || '').localeCompare(b.description || '') * order;
    }
  });

  if (loading) {
    return (
      <div className="transaction-section">
        <div className="loading-message">
          <h3>Loading transactions...</h3>
          <p>Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-section">
        <div className="loading-message">
          <h3>Error loading transactions</h3>
          <p>{error.message || 'Something went wrong. Please try again.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-section">
      <div className="transaction-header">
        <h3>Transaction History</h3>
        <div className="transaction-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn" 
                onClick={() => setSearchTerm('')} 
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          {transactions.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>
      </div>
      
      <div className="transactions-container">
        {sortedTransactions.length === 0 ? (
          <p className="no-transactions">
            {searchTerm ? (
              <>
                No transactions found matching "{searchTerm}" 🔍
                <br />
                <button className="clear-search-btn-inline" onClick={() => setSearchTerm('')}>
                  Clear search
                </button>
              </>
            ) : (
              'No transactions yet. Add your first transaction to get started!'
            )}
          </p>
        ) : (
          sortedTransactions.map(transaction => (
            <div key={transaction.id} className={`transaction ${transaction.amount < 0 ? 'minus' : 'plus'}`}>
              <div className="transaction-details">
                <div className="transaction-info">
                  <span className="transaction-text">{transaction.description || 'Unnamed Transaction'}</span>
                  <span className="transaction-date">
                    {formatDate(transaction.timestamp || transaction.date)}
                  </span>
                  {transaction.category && (
                    <span className="transaction-category">
                      {transaction.category}
                    </span>
                  )}
                  {transaction.split?.length > 0 && (
                    <div className="split-info">
                      <span className="split-label">Split with:</span>
                      {transaction.split.map((splitItem, index) => (
                        <span key={index} className="split-participant">
                          {splitItem.name} (₹{splitItem.amount.toFixed(2)})
                          {index < transaction.split.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`amount ${transaction.amount < 0 ? 'minus' : 'plus'}`}>
                  {formatAmount(transaction.amount)}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(transaction.id)} 
                className="delete-btn" 
                aria-label="Delete transaction"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      timestamp: PropTypes.string,
      date: PropTypes.string,
      category: PropTypes.string,
      split: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          amount: PropTypes.number.isRequired
        })
      )
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  error: PropTypes.object,
  loading: PropTypes.bool
};

export default TransactionList;
