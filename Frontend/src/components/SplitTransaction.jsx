import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/Split.css';

const SplitTransaction = ({ amount, onSplitConfirm }) => {
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitType, setSplitType] = useState('equal');
  const [error, setError] = useState('');
  const [allParticipants, setAllParticipants] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});

  useEffect(() => {
    // Load participants from localStorage
    const savedParticipants = localStorage.getItem('splitParticipants');
    if (savedParticipants) {
      setAllParticipants(JSON.parse(savedParticipants));
    }
  }, []);

  const handleParticipantToggle = (participantName) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantName)) {
        return prev.filter(p => p !== participantName);
      } else {
        return [...prev, participantName];
      }
    });
  };

  const handleAmountChange = (participantName, value) => {
    if (splitType === 'custom') {
      setCustomAmounts(prev => ({
        ...prev,
        [participantName]: value
      }));
    }
  };

  const calculateSplits = () => {
    setError('');
    
    if (selectedParticipants.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    let splits = [];
    const totalParticipants = selectedParticipants.length + 1; // +1 for you

    if (splitType === 'equal') {
      const splitAmount = (amount / totalParticipants).toFixed(2);
      // Add splits for selected participants
      splits = selectedParticipants.map(name => ({
        name,
        amount: parseFloat(splitAmount)
      }));
    } else {
      // Validate custom amounts
      const totalCustomAmount = Object.values(customAmounts)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      
      if (Math.abs(totalCustomAmount - amount) > 0.01) {
        setError(`Total split amount (${totalCustomAmount}) must equal the transaction amount (${amount})`);
        return;
      }

      splits = selectedParticipants.map(name => ({
        name,
        amount: parseFloat(customAmounts[name] || 0)
      }));
    }

    onSplitConfirm(splits);
  };

  return (
    <div className="split-transaction">
      <h3>Split Transaction</h3>
      <div className="split-type-selector">
        <label className="radio-label">
          <input
            type="radio"
            value="equal"
            checked={splitType === 'equal'}
            onChange={(e) => setSplitType(e.target.value)}
          />
          Split Equally
        </label>
        <label className="radio-label">
          <input
            type="radio"
            value="custom"
            checked={splitType === 'custom'}
            onChange={(e) => setSplitType(e.target.value)}
          />
          Custom Split
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="participants-list">
        <h4>Select Participants</h4>
        <div className="split-info-text">
          You will be included in the split automatically
        </div>
        {allParticipants.map((participant) => (
          <div key={participant} className="participant-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedParticipants.includes(participant)}
                onChange={() => handleParticipantToggle(participant)}
              />
              {participant}
            </label>
            {splitType === 'custom' && selectedParticipants.includes(participant) && (
              <div className="input-group">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  value={customAmounts[participant] || ''}
                  onChange={(e) => handleAmountChange(participant, e.target.value)}
                  placeholder="Enter amount..."
                  className="amount-input"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="split-summary">
        {splitType === 'equal' && selectedParticipants.length > 0 && (
          <div>
            Total Amount: ₹{amount}<br />
            Each Person's Share (including you): ₹{(amount / (selectedParticipants.length + 1)).toFixed(2)}
          </div>
        )}
        {splitType === 'custom' && (
          <div>Total Amount to Split: ₹{amount}</div>
        )}
      </div>

      <div className="split-actions">
        <button className="confirm-split-btn" onClick={calculateSplits}>
          Confirm Split
        </button>
      </div>
    </div>
  );
};

SplitTransaction.propTypes = {
  amount: PropTypes.number.isRequired,
  onSplitConfirm: PropTypes.func.isRequired,
};

export default SplitTransaction; 