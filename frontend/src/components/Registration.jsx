import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Registration() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          throw new Error(errorData.detail || `Registration failed (Status: ${response.status})`);
        } catch (jsonError) {
          console.error('Non-JSON response:', await response.text());
          throw new Error(`Server error (Status: ${response.status})`);
        }
      }
      const data = await response.json();
      const loginSuccess = await login(formData.username, formData.password);
      if (loginSuccess) {
        navigate('/');
      } else {
        setError('Auto-login failed. Please log in manually.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-dark-2 rounded-xl shadow-2xl p-8 space-y-6 border border-dark-3 animate-fade-in">
        <h2 className="text-4xl font-bold text-center text-primary mb-6">Join Eliana Cinema</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-text-light text-lg font-medium mb-2" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light placeholder-text-dark focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            />
          </div>
          <div>
            <label className="block text-text-light text-lg font-medium mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light placeholder-text-dark focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            />
          </div>
          <div>
            <label className="block text-text-light text-lg font-medium mb-2" htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light placeholder-text-dark focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              placeholder="+251..."
            />
          </div>
          <div>
            <label className="block text-text-light text-lg font-medium mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light placeholder-text-dark focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            />
          </div>
          {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg mt-6"
          >
            Register
          </button>
        </form>
        <p className="text-center text-text-dark text-md mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registration;