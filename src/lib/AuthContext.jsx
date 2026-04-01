import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '@/api/firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = {};
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(userRef);
          if (profileSnap.exists()) {
            profile = profileSnap.data();
          } else {
            const bootstrapProfile = {
              email: firebaseUser.email,
              full_name: firebaseUser.displayName || '',
              onboarding_complete: false,
              role: 'user',
            };
            await setDoc(userRef, bootstrapProfile, { merge: true });
            profile = bootstrapProfile;
          }
        } catch (error) {
          console.error('Failed to load Firestore user profile:', error);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || profile.full_name || '',
          ...profile,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (data) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    await setDoc(doc(db, 'users', auth.currentUser.uid), data, { merge: true });
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
