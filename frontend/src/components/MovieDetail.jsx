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
      // Step 1: Create booking
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

      // Step 2: Initiate Telebirr payment
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
      // Redirect to Telebirr payment URL
      window.location.href = paymentData.toPayUrl;
    } catch (error) {
      setError(error.message || 'Error processing payment');
      console.error('Booking error:', error);
    }
  };

  if (loading) return <div className="text-center p-4">Loading movie details...</div>;
  if (error && !movie) return <div className="text-center p-4 text-red-600">{error}</div>;
  if (!movie) return <div className="text-center p-4">Movie not found.</div>;

  const seatRows = ['A', 'B', 'C', 'D', 'E'];
  const seatColumns = Array.from({ length: 10 }, (_, i) => i + 1);
  const seats = seatRows.flatMap(row => seatColumns.map(col => `${row}${col}`));
  const aisleColumns = [4, 7];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img src={movie.poster} alt={movie.title} className="w-full h-96 object-cover rounded" />
      <h2 className="text-2xl font-bold mt-4">{movie.title}</h2>
      <p className="text-gray-600">{movie.description || 'No description available.'}</p>
      <p className="text-gray-600">Genre: {movie.genre}</p>
      <p className="text-gray-600">Duration: {movie.duration} minutes</p>
      <h3 className="text-xl font-semibold mt-4">Showtimes</h3>
      <ul className="list-disc pl-5">
        {showtimes.map(showtime => (
          <li key={showtime.id}>
            {showtime.theater.name} - {new Date(showtime.date_time).toLocaleString()}
          </li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold mt-4">Book Tickets</h3>
      {!user ? (
        <p>
          Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to book tickets.
        </p>
      ) : (
        <form onSubmit={handleBooking} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700">Select Showtime:</label>
            <select
              value={selectedShowtime}
              onChange={(e) => setSelectedShowtime(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a showtime</option>
              {showtimes.map(showtime => (
                <option key={showtime.id} value={showtime.id}>
                  {showtime.theater.name} - {new Date(showtime.date_time).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Select Seats:</label>
            <div className="flex flex-col items-center">
              <div className="flex mb-2">
                <div className="w-8"></div>
                {seatColumns.map(col => (
                  <div key={col} className={`w-10 text-center ${aisleColumns.includes(col) ? 'mr-4' : ''}`}>
                    {col}
                  </div>
                ))}
              </div>
              {seatRows.map(row => (
                <div key={row} className="flex items-center">
                  <div className="w-8 text-center font-bold">{row}</div>
                  {seatColumns.map(col => {
                    const seat = `${row}${col}`;
                    return (
                      <div key={seat} className={aisleColumns.includes(col) ? 'mr-4' : ''}>
                        <button
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={bookedSeats.includes(seat)}
                          className={`w-10 h-10 rounded text-white ${
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
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Green: Available, Blue: Selected, Red: Booked
            </p>
            {selectedSeats.length > 0 && (
              <p className="text-sm text-gray-700 mt-2">
                Selected: {selectedSeats.join(', ')} ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
              </p>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading || selectedSeats.length === 0}
          >
            Pay with Telebirr
          </button>
          {bookingMessage && (
            <p className={`mt-2 ${bookingMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {bookingMessage}
            </p>
          )}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default MovieDetail;