import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
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
      const response = await fetch('http://localhost:8000/api/register/', {
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
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Join Eliana Cinema</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-red-600 transition duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-red-600 transition duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-red-600 transition duration-300"
              placeholder="+251..."
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-red-600 transition duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition duration-300"
          >
            Register
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
        <p className="text-gray-400 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registration;