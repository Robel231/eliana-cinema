import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/movies/')
      .then(response => setMovies(response.data))
      .catch(error => console.error('Error fetching movies:', error));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {movies.map(movie => (
        <div key={movie.id} className="bg-white rounded-lg shadow-md p-4">
          <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover rounded" />
          <h2 className="text-xl font-semibold mt-2">{movie.title}</h2>
          <p className="text-gray-600">{movie.genre}</p>
          <Link to={`/movie/${movie.id}`} className="text-blue-600 hover:underline mt-2 block">
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}

export default MovieList;