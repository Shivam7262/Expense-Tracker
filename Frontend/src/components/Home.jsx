import React from 'react';
import PropTypes from 'prop-types';
import AddTransaction from './AddTransaction';
import '../styles/Home.css';

const Home = ({ totalIncome, totalExpense, totalBalance, onAddTransaction }) => {
  return (
    <div className="home-container">
      <div className="summary-section">
        <div className="summary-card income">
          <div className="card-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="card-content">
            <h3>Total Income</h3>
            <span className="amount-positive">₹{totalIncome.toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-card expense">
          <div className="card-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="card-content">
            <h3>Total Expense</h3>
            <span className="amount-negative">₹{totalExpense.toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-card balance">
          <div className="card-icon">
            <i className="fas fa-piggy-bank"></i>
          </div>
          <div className="card-content">
            <h3>Remaining</h3>
            <span className={`amount ${totalBalance >= 0 ? 'amount-positive' : 'amount-negative'}`}>
              ₹{Math.abs(totalBalance).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="home-content">
        <div className="transaction-section">
          <AddTransaction onAddTransaction={onAddTransaction} />
        </div>
      </div>
    </div>
  );
};

Home.propTypes = {
  totalIncome: PropTypes.number.isRequired,
  totalExpense: PropTypes.number.isRequired,
  totalBalance: PropTypes.number.isRequired,
  onAddTransaction: PropTypes.func.isRequired,
};

export default Home; 