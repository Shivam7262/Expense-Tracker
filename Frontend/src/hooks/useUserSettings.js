import { useState, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useUserSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const userSettingsRef = doc(db, 'userSettings', user.uid);

    const unsubscribe = onSnapshot(userSettingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      } else {
        // Initialize default settings
        const defaultSettings = {
          income: 0,
          currency: 'INR',
          theme: 'light',
          notifications: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDoc(userSettingsRef, defaultSettings);
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching user settings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (newSettings) => {
    if (!user) return;

    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(userSettingsRef, {
        ...newSettings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  };

  const updateIncome = async (amount) => {
    if (!user) return;
    
    try {
      await updateSettings({ income: Number(amount) });
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    updateIncome
  };
}; 