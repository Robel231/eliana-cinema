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
  const [paymentProof, setPaymentProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies/${id}/`),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/`)
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
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${selectedShowtime}/booked-seats/`)
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
    if (!paymentProof) {
      setBookingMessage('Please upload a payment proof.');
      return;
    }

    try {
      const bookingData = {
        showtime_id: selectedShowtime,
        num_tickets: selectedSeats.length,
        seats: selectedSeats.join(','),
      };

      const bookingResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.detail || 'Booking failed');
      }

      const bookingResult = await bookingResponse.json();
      const bookingId = bookingResult.id;

      const paymentFormData = new FormData();
      paymentFormData.append('booking', bookingId);
      paymentFormData.append('payment_proof', paymentProof);

      const paymentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: paymentFormData,
      });

      if (!paymentResponse.ok) {
        let errorData = {};
        try {
          errorData = await paymentResponse.json();
        } catch (jsonError) {
          console.error('Error parsing payment response JSON:', jsonError);
          throw new Error(`Payment proof upload failed: Invalid response from server. Status: ${paymentResponse.status}`);
        }
        console.error('Payment proof upload error data:', errorData); // Log the error data
        throw new Error(errorData.detail || `Payment proof upload failed: ${JSON.stringify(errorData)}`);
      }

      setBookingMessage('Booking successful! Your payment is pending approval.');
      navigate('/bookings');

    } catch (error) {
      setError(error.message || 'Error processing booking or payment');
      console.error('Booking/Payment error:', error);
    }
  };

  if (loading) return <div className="text-center p-6 text-text-light">Loading movie details...</div>;
  if (error && !movie) return <div className="text-center p-6 text-red-500">{error}</div>;
  if (!movie) return <div className="text-center p-6 text-text-light">Movie not found.</div>;

  const seatRows = ['A', 'B', 'C', 'D', 'E'];
  const seatColumns = Array.from({ length: 10 }, (_, i) => i + 1);
  const seats = seatRows.flatMap(row => seatColumns.map(col => `${row}${col}`));
  const aisleColumns = [4, 7];

  return (
    <div className="bg-dark-1 min-h-screen text-text-light pt-16">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8 mb-8 bg-dark-2 p-6 rounded-xl shadow-lg">
          <img
            src={movie.poster || 'https://via.placeholder.com/300x450?text=Movie+Poster'}
            alt={movie.title}
            className="w-full md:w-1/3 rounded-lg shadow-xl animate-fade-in object-cover"
          />
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4 text-primary animate-fade-in">{movie.title}</h2>
            <p className="text-text-dark mb-2 text-lg"><strong>Genre:</strong> {movie.genre}</p>
            <p className="text-text-dark mb-2 text-lg"><strong>Duration:</strong> {movie.duration} minutes</p>
            <p className="text-text-dark mb-4 text-lg"><strong>Director:</strong> {movie.director || 'N/A'}</p>
            <p className="text-text-light mb-4 leading-relaxed">{movie.description || 'No description available.'}</p>
            <h3 className="text-2xl font-semibold mb-3 text-text-light">Showtimes</h3>
            <select
              value={selectedShowtime}
              onChange={(e) => setSelectedShowtime(e.target.value)}
              className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
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
          <p className="text-center text-text-light text-lg py-8">
            Please <Link to="/login" className="text-primary hover:underline font-semibold">login</Link> to book tickets.
          </p>
        ) : (
          <form onSubmit={handleBooking} className="bg-dark-2 rounded-xl shadow-2xl p-8 border border-dark-3">
            <h3 className="text-3xl font-bold mb-6 text-primary text-center">Select Seats</h3>
            <div className="flex flex-col items-center mb-8">
              <div className="w-full max-w-lg bg-dark-3 text-center py-3 mb-6 rounded-lg text-xl font-semibold shadow-inner">Screen</div>
              <div className="flex mb-3">
                <div className="w-10"></div>
                {seatColumns.map(col => (
                  <div key={col} className={`w-10 text-center font-medium text-text-dark ${aisleColumns.includes(col) ? 'mr-6' : ''}`}>
                    {col}
                  </div>
                ))}
              </div>
              {seatRows.map(row => (
                <div key={row} className="flex items-center mb-3">
                  <div className="w-10 text-center font-bold text-text-light">{row}</div>
                  {seatColumns.map(col => {
                    const seat = `${row}${col}`;
                    return (
                      <div key={seat} className={aisleColumns.includes(col) ? 'mr-6' : ''}>
                        <button
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={bookedSeats.includes(seat)}
                          className={`w-10 h-10 rounded-md text-sm font-semibold transition duration-200 ease-in-out transform hover:scale-105
                            ${bookedSeats.includes(seat)
                              ? 'bg-red-700 text-white cursor-not-allowed opacity-70'
                              : selectedSeats.includes(seat)
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-green-600 text-white hover:bg-green-700'
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
              <div className="flex flex-wrap justify-center space-x-4 mt-6 text-text-dark text-sm">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-600 rounded-sm mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-primary rounded-sm mr-2"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-red-700 rounded-sm mr-2"></div>
                  <span>Booked</span>
                </div>
              </div>
              {selectedSeats.length > 0 && (
                <p className="text-text-light mt-6 text-lg font-medium">
                  Selected: <span className="text-primary">{selectedSeats.join(', ')}</span> ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                </p>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="paymentProof" className="block text-text-light text-lg font-medium mb-2">Upload Payment Proof</label>
              <input
                type="file"
                id="paymentProof"
                onChange={(e) => setPaymentProof(e.target.files[0])}
                className="w-full p-3 rounded-lg bg-dark-3 border border-dark-3 text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-red-700 transition duration-300 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || selectedSeats.length === 0 || !paymentProof}
            >
              Submit Booking
            </button>
            {bookingMessage && (
              <p className={`mt-4 text-center text-lg ${bookingMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {bookingMessage}
              </p>
            )}
            {error && <p className="text-red-500 text-center mt-4 text-lg">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;