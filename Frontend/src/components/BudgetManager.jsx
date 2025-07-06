import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other'
];

const BudgetManager = ({ transactions, onBudgetUpdate }) => {
  const [budgets, setBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : 
      CATEGORIES.reduce((acc, category) => ({ ...acc, [category]: 0 }), {});
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    if (onBudgetUpdate) {
      onBudgetUpdate(budgets);
    }
  }, [budgets, onBudgetUpdate]);

  const calculateSpending = (category) => {
    return transactions
      .filter(t => t.category === category && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const handleBudgetUpdate = (category) => {
    const amount = parseFloat(newBudget);
    if (!isNaN(amount) && amount >= 0) {
      setBudgets(prev => ({ ...prev, [category]: amount }));
      setEditingCategory(null);
      setNewBudget('');
    }
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  return (
    <div className="budget-section">
      <div className="budget-header">
        <h3>Budget Management</h3>
        <p className="budget-subtitle">Set and track your monthly spending limits</p>
      </div>

      <div className="budget-list">
        {CATEGORIES.map(category => {
          const budget = budgets[category];
          const spent = calculateSpending(category);
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const progressColor = getProgressColor(spent, budget);

          return (
            <div key={category} className="budget-item">
              <div className="budget-category">
                <div className="category-info">
                  <span className={`category-badge category-${category}`}>
                    {category}
                  </span>
                  {editingCategory === category ? (
                    <div className="budget-edit">
                      <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        placeholder="Enter budget amount"
                        min="0"
                        step="100"
                        className="budget-input"
                      />
                      <button
                        onClick={() => handleBudgetUpdate(category)}
                        className="save-budget-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setNewBudget('');
                        }}
                        className="cancel-budget-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setNewBudget(budget.toString());
                      }}
                      className="edit-budget-btn"
                    >
                      {budget > 0 ? `₹${budget.toFixed(2)}` : 'Set Budget'}
                    </button>
                  )}
                </div>
              </div>

              <div className="budget-progress">
                <div
                  className={`budget-bar ${progressColor}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              <div className="budget-details">
                <span>Spent: ₹{spent.toFixed(2)}</span>
                {budget > 0 && (
                  <>
                    <span>Remaining: ₹{Math.max(budget - spent, 0).toFixed(2)}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </>
                )}
              </div>

              {budget > 0 && spent/budget > 0.9 && (
                <div className="budget-alert">
                  Warning: You've used {percentage.toFixed(1)}% of your {category} budget!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

BudgetManager.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
  onBudgetUpdate: PropTypes.func,
};

export default BudgetManager; 