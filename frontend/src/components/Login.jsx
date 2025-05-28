import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { AuthContext } from '../context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Login to Eliana Cinema</h2>
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
            className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Login
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;