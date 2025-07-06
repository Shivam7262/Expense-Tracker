import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/IncomePopup.css';

const IncomePopup = ({ income, setIncome, closePopup }) => {
  const [newIncome, setNewIncome] = useState(income);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newIncome || newIncome < 0) {
      setError('Please enter a valid income amount');
      return;
    }
    setIncome(Number(newIncome));
    closePopup();
  };

  const handleSkip = () => {
    setIncome(0);
    closePopup();
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <h2>Welcome to Your Expense Tracker! 🎉</h2>
          <p className="popup-subtitle">Let's start by setting up your monthly income</p>
        </div>

        <form onSubmit={handleSubmit} className="popup-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="income">Monthly Income</label>
            <div className="income-input-group">
              <span className="currency-symbol">₹</span>
              <input
                id="income"
                type="number"
                value={newIncome}
                onChange={(e) => {
                  setNewIncome(e.target.value);
                  setError('');
                }}
                placeholder="Enter your monthly income"
                className="income-input"
                min="0"
                step="100"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="popup-actions">
            <button type="submit" className="save-income-btn">
              Save & Continue
            </button>
            <button 
              type="button" 
              onClick={handleSkip} 
              className="skip-btn"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

IncomePopup.propTypes = {
  income: PropTypes.number.isRequired,
  setIncome: PropTypes.func.isRequired,
  closePopup: PropTypes.func.isRequired,
};

export default IncomePopup;
