import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const transactionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransactions(transactionData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        setError(error);
        setLoading(false);
        
        // If the error is about missing index, provide helpful message
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.log('Creating index... This might take a few minutes.');
          // You can show this message to the user in your UI
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (transactionData) => {
    try {
      setError(null);
      await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        userId: user.uid,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error);
      throw error;
    }
  };

  const clearAllTransactions = async () => {
    try {
      setError(null);
      const promises = transactions.map(transaction => 
        deleteDoc(doc(db, 'transactions', transaction.id))
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing transactions:', error);
      setError(error);
      throw error;
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    clearAllTransactions
  };
}; 