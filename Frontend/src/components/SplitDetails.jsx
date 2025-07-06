import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/Split.css';

const SplitDetails = ({ transactions, onAddSplit }) => {
  const [participants, setParticipants] = useState(() => {
    const savedParticipants = localStorage.getItem('splitParticipants');
    return savedParticipants ? JSON.parse(savedParticipants) : [];
  });

  const [personalExpenses, setPersonalExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('personalExpenses');
    return savedExpenses ? JSON.parse(savedExpenses) : {};
  });

  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [error, setError] = useState('');
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    localStorage.setItem('splitParticipants', JSON.stringify(participants));
    localStorage.setItem('personalExpenses', JSON.stringify(personalExpenses));
  }, [participants, personalExpenses]);

  // Calculate total split amount for each participant
  const calculateParticipantTotals = () => {
    const totals = {};
    
    // Initialize totals for all participants
    participants.forEach(p => {
      totals[p] = 0;
    });

    // Add up all split transactions
    transactions.forEach(transaction => {
      if (transaction.split) {
        transaction.split.forEach(split => {
          if (totals[split.name] !== undefined) {
            totals[split.name] += split.amount;
          }
        });
      }
    });

    // Subtract personal expenses
    Object.entries(personalExpenses).forEach(([participant, expenses]) => {
      if (totals[participant] !== undefined) {
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        totals[participant] -= totalExpenses;
      }
    });

    return totals;
  };

  const getAllTransactions = (participantName) => {
    const splitTransactions = transactions
      .filter(t => t.split && t.split.some(s => s.name === participantName))
      .map(t => ({
        ...t,
        amount: t.split.find(s => s.name === participantName).amount,
        type: 'split'
      }));

    const personalTransactions = (personalExpenses[participantName] || [])
      .map(exp => ({
        id: exp.date,
        description: exp.description,
        amount: -exp.amount,
        date: exp.date,
        type: 'paid_for_you'
      }));

    return [...splitTransactions, ...personalTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const participantTotals = calculateParticipantTotals();

  const handleAddParticipant = () => {
    const name = prompt('Enter participant name:');
    if (name && name.trim()) {
      const trimmedName = name.trim();
      if (!participants.includes(trimmedName)) {
        setParticipants([...participants, trimmedName]);
        setPersonalExpenses(prev => ({ ...prev, [trimmedName]: [] }));
      } else {
        alert('This participant already exists!');
      }
    }
  };

  const handleRemoveParticipant = (participantName) => {
    if (window.confirm(`Are you sure you want to remove ${participantName}? This will delete all their transactions and expenses.`)) {
      setParticipants(prev => prev.filter(p => p !== participantName));
      setPersonalExpenses(prev => {
        const newExpenses = { ...prev };
        delete newExpenses[participantName];
        return newExpenses;
      });
      if (selectedParticipant === participantName) {
        setSelectedParticipant(null);
        setShowTable(false);
      }
    }
  };

  const handleAddSplit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedParticipant) {
      setError('Please select a participant');
      return;
    }

    if (!newAmount || parseFloat(newAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    const splitData = {
      id: Math.random().toString(36).substr(2, 9),
      description: description.trim(),
      amount: -Math.abs(parseFloat(newAmount)),
      category: 'Split Payment',
      date: new Date().toISOString(),
      split: [{
        name: selectedParticipant,
        amount: parseFloat(newAmount)
      }]
    };

    onAddSplit(splitData);
    setNewAmount('');
    setDescription('');
    setShowTable(true);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setError('');

    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    if (!expenseDescription.trim()) {
      setError('Please enter an expense description');
      return;
    }

    const newExpense = {
      description: expenseDescription.trim(),
      amount: parseFloat(expenseAmount),
      date: new Date().toISOString()
    };

    setPersonalExpenses(prev => ({
      ...prev,
      [selectedParticipant]: [...(prev[selectedParticipant] || []), newExpense]
    }));

    setExpenseAmount('');
    setExpenseDescription('');
  };

  const handleParticipantSelect = (participant) => {
    setSelectedParticipant(participant);
    setShowTable(true);
  };

  const handleRemoveTransaction = (transaction) => {
    if (transaction.type === 'paid_for_you') {
      handleRemoveExpense(selectedParticipant, transaction.id);
    } else {
      if (window.confirm('Are you sure you want to remove this split?')) {
        const updatedTransactions = transactions.filter(t => t.id !== transaction.id);
        onAddSplit({
          type: 'UPDATE_TRANSACTIONS',
          transactions: updatedTransactions
        });
      }
    }
  };

  const handleRemoveExpense = (participantName, expenseDate) => {
    if (window.confirm('Are you sure you want to remove this expense?')) {
      setPersonalExpenses(prev => ({
        ...prev,
        [participantName]: prev[participantName].filter(exp => exp.date !== expenseDate)
      }));
    }
  };

  return (
    <div className="split-details-page">
      <div className="split-details-header">
        <h2>Split Details</h2>
        <button onClick={handleAddParticipant} className="add-participant-btn">
          Add New Participant
        </button>
      </div>

      <div className="participants-summary">
        {participants.map(participant => (
          <div 
            key={participant} 
            className={`participant-card ${selectedParticipant === participant ? 'selected' : ''}`}
            onClick={() => handleParticipantSelect(participant)}
          >
            <div className="participant-card-header">
              <h3>{participant}</h3>
              <button 
                className="remove-participant-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveParticipant(participant);
                }}
              >
                ×
              </button>
            </div>
            <p className="total-amount">
              Total Due: ₹{participantTotals[participant].toFixed(2)}
            </p>
            <button className="select-participant-btn">
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedParticipant && showTable && (
        <>
          <div className="all-transactions-table">
            <h3>All Transactions for {selectedParticipant}</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllTransactions(selectedParticipant).map(transaction => (
                    <tr key={transaction.id} className={transaction.type}>
                      <td>
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type === 'split' ? 'Split' : 'Paid For You'}
                        </span>
                      </td>
                      <td className={transaction.amount >= 0 ? 'amount-cell' : 'expense-cell'}>
                        ₹{Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td>
                        <button 
                          className="remove-split-btn"
                          onClick={() => handleRemoveTransaction(transaction)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="3">Final Balance</td>
                    <td colSpan="2" className="total-cell">
                      ₹{participantTotals[selectedParticipant].toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="add-expense-form">
            <h3>{selectedParticipant} Paid For You</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddExpense}>
              <div className="form-control">
                <label htmlFor="expenseDescription">Payment Description</label>
                <input
                  type="text"
                  id="expenseDescription"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Enter payment description..."
                />
              </div>

              <div className="form-control">
                <label htmlFor="expenseAmount">Amount Paid</label>
                <div className="input-group">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    id="expenseAmount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="Enter amount..."
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn">
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {selectedParticipant && (
        <div className="add-split-form">
          <h3>Add Split Payment for {selectedParticipant}</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleAddSplit}>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
              />
            </div>

            <div className="form-control">
              <label htmlFor="amount">Amount</label>
              <div className="input-group">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  id="amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Enter amount..."
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn">
                Add Split Payment
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setSelectedParticipant(null);
                  setShowTable(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

SplitDetails.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      split: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          amount: PropTypes.number.isRequired,
        })
      ),
    })
  ).isRequired,
  onAddSplit: PropTypes.func.isRequired,
};

export default SplitDetails; 