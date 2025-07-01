import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function UserProfile() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
        setFormData({ email: data.email, phone: data.phone });
        setLoading(false);
      } catch (err) {
        setError('Error loading profile');
        setLoading(false);
        console.error(err);
      }
    };
    fetchProfile();
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.email?.[0] || 'Failed to update profile');
      }
      const data = await response.json();
      setProfile(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="text-center p-6 text-text-light text-xl">Loading profile...</div>;
  if (error && !profile) return <div className="text-center p-6 text-red-500 text-xl">{error}</div>;

  return (
    <div className="bg-dark-1 min-h-screen text-text-light pt-16">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">User Profile</h1>

        <div className="bg-dark-2 rounded-xl shadow-2xl p-8 mb-8 border border-dark-3">
          <h2 className="text-3xl font-bold text-text-light mb-6">Account Details</h2>
          <p className="text-text-light text-lg mb-4"><strong>Username:</strong> {profile?.username}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-text-light text-lg font-medium mb-2" htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light placeholder-text-dark focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-text-light text-lg font-medium mb-2" htmlFor="phone">Phone:</label>
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
            {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
            {success && <p className="text-green-500 text-center text-sm mt-4">{success}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg mt-6"
            >
              Update Profile
            </button>
          </form>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg mt-4"
          >
            Logout
          </button>
        </div>

        <div className="bg-dark-2 rounded-xl shadow-2xl p-8 border border-dark-3">
          <h2 className="text-3xl font-bold text-text-light mb-6">Booking History</h2>
          {profile?.bookings?.length === 0 ? (
            <p className="text-center text-text-dark text-lg py-4">No bookings found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.bookings?.map(booking => (
                <div key={booking.id} className="bg-dark-3 rounded-lg shadow-md p-5 border border-dark-2 transition duration-300 ease-in-out hover:shadow-lg">
                  <p className="text-text-light text-lg mb-1"><strong>Movie:</strong> {booking.showtime.movie.title}</p>
                  <p className="text-text-dark text-md mb-1"><strong>Theater:</strong> {booking.showtime.theater.name}</p>
                  <p className="text-text-dark text-md mb-1"><strong>Showtime:</strong> {new Date(booking.showtime.date_time).toLocaleString()}</p>
                  <p className="text-text-dark text-md mb-1"><strong>Seats:</strong> {booking.seats}</p>
                  <p className="text-text-dark text-md mb-1"><strong>Tickets:</strong> {booking.num_tickets}</p>
                  <p className="text-text-dark text-md"><strong>Booked on:</strong> {new Date(booking.booking_time).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;