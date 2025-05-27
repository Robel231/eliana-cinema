import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Bookings() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        console.log('Fetching bookings with token:', token ? 'Present' : 'Missing');
        const response = await fetch('http://localhost:8000/api/bookings/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
        setLoading(false);
      } catch (error) {
        console.error('Fetch bookings error:', error);
        setError(error.message || 'Error fetching bookings');
        setLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    } else {
      setError('Please log in to view bookings');
      setLoading(false);
    }
  }, [token]);

  if (loading) return <div className="text-center p-4">Loading bookings...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map(booking => (
            <li key={booking.id} className="bg-white rounded-lg shadow-md p-4">
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
  );
}

export default Bookings;