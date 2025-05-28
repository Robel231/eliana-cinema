import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Fetch movies from backend
    fetch('http://localhost:8000/api/movies/')
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error('Error fetching movies:', error));
  }, []);

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
            Welcome to Eliana Cinema
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Experience the Magic of Movies
          </p>
          <Link
            to="/movies"
            className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-red-700 transition duration-300"
          >
            Browse Movies
          </Link>
        </div>
      </section>

      {/* Movies Section */}
      <section className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-white mb-6">Now Showing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Link
              to={`/movie/${movie.id}`}
              key={movie.id}
              className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
            >
              <img
                src={movie.poster_url || 'https://via.placeholder.com/300x450?text=Movie+Poster'}
                alt={movie.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                <p className="text-gray-400">{movie.genre}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;