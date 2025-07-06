import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/AddTransaction.css';

const AddTransaction = ({ onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      amount: type === 'expense' ? -numAmount : numAmount,
      category,
      type,
      timestamp: new Date().toISOString()
    };

    onAddTransaction(transaction);
    setDescription('');
    setAmount('');
    setCategory('food');
    setError('');
  };

  return (
    <div className="add-transaction-container">
      <form onSubmit={handleSubmit} className="add-transaction-form">
        <h2 className="form-title">Add New Transaction</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Transaction Type</label>
          <div className="type-selection">
            <button
              type="button"
              className={`type-option ${type === 'expense' ? 'selected expense' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`type-option ${type === 'income' ? 'selected income' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              Income
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter transaction description"
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input category-select"
            required
          >
            <option value="food">Food & Dining</option>
            <option value="transport">Transportation</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills & Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="health">Health & Medical</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <div className="amount-input-group">
            <span className="currency-symbol">₹</span>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="form-input amount-input"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <button type="submit" className="submit-btn">
          Add Transaction
        </button>
      </form>
    </div>
  );
};

AddTransaction.propTypes = {
  onAddTransaction: PropTypes.func.isRequired,
};

export default AddTransaction;
