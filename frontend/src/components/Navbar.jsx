import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-black bg-opacity-90 p-4 shadow-lg fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          Eliana Cinema
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="text-white hover:text-red-600 transition duration-300">
              Home
            </Link>
          </li>
          <li>
            <Link to="/bookings" className="text-white hover:text-red-600 transition duration-300">
              Bookings
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/profile" className="text-white hover:text-red-600 transition duration-300">
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-red-600 hover:text-black px-4 py-2 rounded transition duration-300"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="text-white hover:text-red-600 transition duration-300">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white hover:text-red-600 transition duration-300">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;