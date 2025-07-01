import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Bookings() {
  const { user, token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/`, {
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

  useEffect(() => {
    if (token) {
      fetchBookings();
    n  } else {
      setError('Please log in to view bookings');
      setLoading(false);
    }
  }, [token]);

  const handleApprove = async (paymentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/${paymentId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to approve payment');
      }
      fetchBookings(); // Re-fetch bookings to update status
    } catch (error) {
      console.error('Approve payment error:', error);
      setError('Failed to approve payment.');
    }
  };

  if (loading) return <div className="text-center p-6 text-text-light text-xl">Loading bookings...</div>;
  if (error) return <div className="text-center p-6 text-red-500 text-xl">{error}</div>;

  return (
    <div className="bg-dark-1 min-h-screen text-text-light pt-16">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">Your Bookings</h1>
        {bookings.length === 0 ? (
          <p className="text-center text-text-dark text-lg py-8">No bookings found. Start by exploring our movies!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-dark-2 rounded-xl shadow-xl p-6 border border-dark-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-2xl font-semibold text-text-light mb-3">Movie: {booking.showtime.movie.title}</h2>
                <p className="text-text-dark mb-1"><strong>Theater:</strong> {booking.showtime.theater.name}</p>
                <p className="text-text-dark mb-1"><strong>Showtime:</strong> {new Date(booking.showtime.date_time).toLocaleString()}</p>
                <p className="text-text-dark mb-1"><strong>Seats:</strong> {booking.seats}</p>
                <p className="text-text-dark mb-1"><strong>Tickets:</strong> {booking.num_tickets}</p>
                <p className="text-text-dark mb-3"><strong>Booked on:</strong> {new Date(booking.booking_time).toLocaleString()}</p>
                <p className={`text-lg font-bold ${booking.payment_status === 'COMPLETED' ? 'text-green-500' : booking.payment_status === 'PENDING_APPROVAL' ? 'text-yellow-500' : 'text-red-500'} mb-4`}>
                  Payment Status: {booking.payment_status.replace(/_/g, ' ')}
                </p>

                {booking.payment && (
                  <div className="mb-4">
                    <p className="text-text-light font-medium mb-2">Payment Proof:</p>
                    <a href={`${import.meta.env.VITE_API_BASE_URL}${booking.payment.payment_proof}`} target="_blank" rel="noopener noreferrer">
                      <img src={`${import.meta.env.VITE_API_BASE_URL}${booking.payment.payment_proof}`} alt="Payment Proof" className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition duration-300" />
                    </a>
                  </div>
                )}

                {user && user.is_staff && booking.payment_status === 'PENDING_APPROVAL' && booking.payment && (
                  <button
                    onClick={() => handleApprove(booking.payment.id)}
                    className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                  >
                    Approve Payment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;