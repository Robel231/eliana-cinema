import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/movies/');
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        const data = await response.json();
        setMovies(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading movies');
        setLoading(false);
        console.error(err);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <div className="text-center p-4">Loading movies...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Now Showing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map(movie => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{movie.title}</h3>
              <p className="text-gray-600">{movie.genre}</p>
              <p className="text-gray-600">{movie.duration} minutes</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;