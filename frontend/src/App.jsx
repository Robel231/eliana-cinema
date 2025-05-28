import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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
        <div className="text-center p-4 text-red-500">
          Something went wrong: {this.state.error?.message || 'Unknown error'}.
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <div className="bg-gradient-to-b from-black to-gray-900 min-h-screen">
      <Navbar />
      <div className="pt-20">
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
      </div>
    </div>
  );
}

export default App;