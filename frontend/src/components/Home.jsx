import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Fetch movies from backend
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies/`)
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error('Error fetching movies:', error));
  }, []);

  return (
    <div className="bg-dark-1 min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div className="relative z-10 text-center text-white p-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in drop-shadow-lg">
            Welcome to Eliana Cinema
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-medium">
            Experience the Magic of Movies
          </p>
          <Link
            to="/movies"
            className="bg-primary text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Browse Movies
          </Link>
        </div>
      </section>

      {/* Movies Section */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">Now Showing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {movies.map((movie) => (
            <Link
              to={`/movie/${movie.id}`}
              key={movie.id}
              className="group bg-dark-2 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-2 block"
            >
              <img
                src={movie.poster || 'https://via.placeholder.com/300x450?text=Movie+Poster'}
                alt={movie.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition duration-300 ease-in-out"
              />
              <div className="p-5 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">{movie.title}</h3>
                <p className="text-gray-400 text-sm">{movie.genre}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;