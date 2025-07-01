import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate logging in and setting a user object
  const login = async (email, password) => {
    console.log(`Simulating login for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = { email, name: 'John Doe', token: 'fake-jwt-token' };
    localStorage.setItem('localBrandUser', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  // Simulate logging out
  const logout = () => {
    localStorage.removeItem('localBrandUser');
    setCurrentUser(null);
  };

  const getToken = async () => {
      const user = JSON.parse(localStorage.getItem('localBrandUser'));
      return user?.token;
  }

  useEffect(() => {
    // Check local storage for a persisted user session
    const storedUser = localStorage.getItem('localBrandUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const value = { currentUser, login, logout, getToken };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
