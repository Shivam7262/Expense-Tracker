import React from 'react';
import PropTypes from 'prop-types';
import '../styles.css';

const IncomeExpense = ({ income, expense }) => {
  return (
    <div className="inc-exp-container">
      <div className="inc-exp-item income">
        <h4>Income</h4>
        <p className="money plus">
          ₹{income.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="vertical-line"></div>
      <div className="inc-exp-item expense">
        <h4>Expense</h4>
        <p className="money minus">
          ₹{expense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

IncomeExpense.propTypes = {
  income: PropTypes.number.isRequired,
  expense: PropTypes.number.isRequired,
};

export default IncomeExpense;
