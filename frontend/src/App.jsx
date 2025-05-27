import { Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './components/Home';
import MovieDetail from './components/MovieDetail';
import Bookings from './components/Bookings';
import Login from './components/Login';
import Registration from './components/Registration';
import UserProfile from './components/UserProfile';
import PaymentConfirmation from './components/PaymentConfirmation';
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 text-red-600">
          Something went wrong: {this.state.error?.message || 'Unknown error'}.
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/bookings" className="hover:underline">Bookings</Link></li>
          {user ? (
            <>
              <li><Link to="/profile" className="hover:underline">Profile</Link></li>
              <li>
                <button onClick={logout} className="hover:underline">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:underline">Login</Link></li>
              <li><Link to="/register" className="hover:underline">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/payment/confirm" element={<PaymentConfirmation />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}

export default App;