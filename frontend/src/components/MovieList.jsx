import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/movies/`)
      .then(response => {
        setMovies(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
        setError('Failed to load movies. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-text-light text-xl py-8">Loading movies...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl py-8">{error}</div>;
  }

  return (
    <div className="bg-dark-1 min-h-screen text-text-light pt-16">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">All Movies</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {movies.map(movie => (
            <div key={movie.id} className="bg-dark-2 rounded-xl shadow-2xl p-5 border border-dark-3 transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-lg">
              <img src={movie.poster} alt={movie.title} className="w-full h-72 object-cover rounded-lg mb-4" />
              <h2 className="text-xl font-semibold text-text-light mb-2">{movie.title}</h2>
              <p className="text-text-dark text-sm mb-4">{movie.genre}</p>
              <Link to={`/movie/${movie.id}`} className="block w-full text-center bg-primary text-white py-2 rounded-lg font-bold hover:bg-red-700 transition duration-300 ease-in-out">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieList;