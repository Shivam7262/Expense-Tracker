import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home from './components/Home';
import ErrorBoundary from './components/ErrorBoundary';
import IncomePopup from './components/IncomePopup';
import TransactionList from './components/TransactionList';
import SplitDetails from './components/SplitDetails';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const App = () => {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [showIncomePopup, setShowIncomePopup] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  const totalBalance = income + transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0) + income;
  const totalExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all transactions?')) {
      setTransactions([]);
    }
  };

  const handleEditIncome = () => {
    setShowIncomePopup(true);
  };

  const handleAddTransaction = (transactionData) => {
    if (transactionData.type === 'UPDATE_TRANSACTIONS') {
      setTransactions(transactionData.transactions);
    } else {
      const newTransaction = {
        ...transactionData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalBalance={totalBalance}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        );

      case 'history':
        return (
          <div className="history-section">
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
              onClearAll={handleClearAll}
            />
          </div>
        );

      case 'split':
        return (
          <div className="split-expense-section">
            <SplitDetails
              transactions={transactions}
              onAddSplit={handleAddTransaction}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <h3>Loading...</h3>
          <p>Please wait while we authenticate you.</p>
        </div>
      </div>
    );
  }

  // Show authentication screens if user is not logged in
  if (!user) {
    return (
      <ErrorBoundary>
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </ErrorBoundary>
    );
  }

  // Show main app if user is authenticated
  return (
    <ErrorBoundary>
      <div className="app-container">
        <Header 
          totalBalance={totalBalance} 
          onEditIncome={handleEditIncome}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        
        {showIncomePopup && (
          <IncomePopup 
            income={income} 
            setIncome={setIncome} 
            closePopup={() => setShowIncomePopup(false)} 
          />
        )}

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
