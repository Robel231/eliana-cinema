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
        const response = await fetch('http://localhost:8000/api/users/me/', {
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
      const response = await fetch('http://localhost:8000/api/users/me/', {
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

  if (loading) return <div className="text-center p-4">Loading profile...</div>;
  if (error && !profile) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-xl font-semibold">Account Details</h3>
        <p><strong>Username:</strong> {profile?.username}</p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="+251..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </form>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-semibold">Booking History</h3>
        {profile?.bookings?.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul className="space-y-4">
            {profile?.bookings?.map(booking => (
              <li key={booking.id} className="border-b pb-2">
                <p><strong>Movie:</strong> {booking.showtime.movie.title}</p>
                <p><strong>Theater:</strong> {booking.showtime.theater.name}</p>
                <p><strong>Showtime:</strong> {new Date(booking.showtime.date_time).toLocaleString()}</p>
                <p><strong>Seats:</strong> {booking.seats}</p>
                <p><strong>Tickets:</strong> {booking.num_tickets}</p>
                <p><strong>Booked on:</strong> {new Date(booking.booking_time).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserProfile;