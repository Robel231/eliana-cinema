import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [bookingMessage, setBookingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8000/api/movies/${id}/`),
      fetch('http://localhost:8000/api/showtimes/')
    ])
      .then(async ([movieResponse, showtimesResponse]) => {
        if (!movieResponse.ok || !showtimesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        const movieData = await movieResponse.json();
        const showtimesData = await showtimesResponse.json();
        setMovie(movieData);
        setShowtimes(showtimesData.filter(showtime => showtime.movie.id === parseInt(id)));
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to fetch movie details');
        setLoading(false);
        console.error(error);
      });
  }, [id]);

  useEffect(() => {
    if (selectedShowtime) {
      fetch(`http://localhost:8000/api/showtimes/${selectedShowtime}/booked-seats/`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch booked seats');
          return response.json();
        })
        .then(data => {
          setBookedSeats(data.booked_seats || []);
          setSelectedSeats(prev => prev.filter(seat => !data.booked_seats.includes(seat)));
        })
        .catch(error => {
          console.error('Error fetching booked seats:', error);
          setBookingMessage('Error loading seat availability.');
        });
    }
  }, [selectedShowtime]);

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev => {
      const newSeats = prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat];
      console.log('Selected seats:', newSeats);
      return newSeats;
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingMessage('');
    setError('');
    if (!user || !token) {
      navigate('/login');
      return;
    }
    if (!selectedShowtime || selectedSeats.length === 0) {
      setBookingMessage('Please select a showtime and at least one seat.');
      return;
    }
    try {
      const bookingResponse = await fetch('http://localhost:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          showtime_id: parseInt(selectedShowtime),
          num_tickets: selectedSeats.length,
          seats: selectedSeats.join(','),
        }),
      });
      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.detail || 'Booking failed');
      }
      const bookingData = await bookingResponse.json();

      const paymentResponse = await fetch(`http://localhost:8000/api/payments/${bookingData.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const paymentContentType = paymentResponse.headers.get('content-type');
      let paymentData;
      if (paymentContentType && paymentContentType.includes('application/json')) {
        paymentData = await paymentResponse.json();
      } else {
        const text = await paymentResponse.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        throw new Error(`Payment server returned non-JSON response (status ${paymentResponse.status})`);
      }
      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to initiate payment');
      }
      window.location.href = paymentData.toPayUrl;
    } catch (error) {
      setError(error.message || 'Error processing payment');
      console.error('Booking error:', error);
    }
  };

  if (loading) return <div className="text-center p-6 text-white">Loading movie details...</div>;
  if (error && !movie) return <div className="text-center p-6 text-red-500">{error}</div>;
  if (!movie) return <div className="text-center p-6 text-white">Movie not found.</div>;

  const seatRows = ['A', 'B', 'C', 'D', 'E'];
  const seatColumns = Array.from({ length: 10 }, (_, i) => i + 1);
  const seats = seatRows.flatMap(row => seatColumns.map(col => `${row}${col}`));
  const aisleColumns = [4, 7];

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 min-h-screen text-white">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <img
            src={movie.poster || 'https://via.placeholder.com/300x450?text=Movie+Poster'}
            alt={movie.title}
            className="w-full md:w-1/3 rounded-lg shadow-lg animate-fade-in"
          />
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4 animate-fade-in">{movie.title}</h2>
            <p className="text-gray-300 mb-2"><strong>Genre:</strong> {movie.genre}</p>
            <p className="text-gray-300 mb-2"><strong>Duration:</strong> {movie.duration} minutes</p>
            <p className="text-gray-300 mb-4"><strong>Description:</strong> {movie.description || 'No description available.'}</p>
            <h3 className="text-2xl font-semibold mb-2">Showtimes</h3>
            <select
              value={selectedShowtime}
              onChange={(e) => setSelectedShowtime(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 transition duration-300 mb-4"
            >
              <option value="">Select a showtime</option>
              {showtimes.map(showtime => (
                <option key={showtime.id} value={showtime.id}>
                  {showtime.theater.name} - {new Date(showtime.date_time).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!user ? (
          <p className="text-center">
            Please <Link to="/login" className="text-red-600 hover:underline">login</Link> to book tickets.
          </p>
        ) : (
          <form onSubmit={handleBooking} className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-semibold mb-4">Select Seats</h3>
            <div className="flex flex-col items-center mb-6">
              <div className="w-full bg-gray-700 text-center py-2 mb-4 rounded">Screen</div>
              <div className="flex mb-2">
                <div className="w-8"></div>
                {seatColumns.map(col => (
                  <div key={col} className={`w-10 text-center ${aisleColumns.includes(col) ? 'mr-4' : ''}`}>
                    {col}
                  </div>
                ))}
              </div>
              {seatRows.map(row => (
                <div key={row} className="flex items-center mb-2">
                  <div className="w-8 text-center font-bold">{row}</div>
                  {seatColumns.map(col => {
                    const seat = `${row}${col}`;
                    return (
                      <div key={seat} className={aisleColumns.includes(col) ? 'mr-4' : ''}>
                        <button
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={bookedSeats.includes(seat)}
                          className={`w-10 h-10 rounded text-white transition duration-300 ${
                            bookedSeats.includes(seat)
                              ? 'bg-red-500 cursor-not-allowed'
                              : selectedSeats.includes(seat)
                              ? 'bg-blue-600'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                          title={seat}
                        >
                          {col}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="flex space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Booked</span>
                </div>
              </div>
              {selectedSeats.length > 0 && (
                <p className="text-gray-300 mt-4">
                  Selected: {selectedSeats.join(', ')} ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition duration-300 disabled:bg-gray-600"
              disabled={loading || selectedSeats.length === 0}
            >
              Pay with Telebirr
            </button>
            {bookingMessage && (
              <p className={`mt-4 text-center ${bookingMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {bookingMessage}
              </p>
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;