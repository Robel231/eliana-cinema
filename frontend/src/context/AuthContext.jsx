import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      console.log('Token loaded:', token ? 'Present' : 'Missing');
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login API error:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }
      const data = await response.json();
      setToken(data.access);
      localStorage.setItem('token', data.access);
      setUser({ username });
      console.log('Login successful, token set:', data.access);
      return true;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    console.log('Logged out, token cleared');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};