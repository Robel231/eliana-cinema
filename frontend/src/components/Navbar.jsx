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
    <nav className="bg-gray-900 bg-opacity-90 p-4 shadow-xl fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-extrabold text-red-600 tracking-wide">
          Eliana Cinema
        </Link>
        <ul className="flex space-x-6 items-center">
          <li>
            <Link to="/" className="text-white hover:text-red-500 transition duration-300 ease-in-out text-lg font-medium">
              Home
            </Link>
          </li>
          <li>
            <Link to="/bookings" className="text-white hover:text-red-500 transition duration-300 ease-in-out text-lg font-medium">
              Bookings
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/profile" className="text-white hover:text-red-500 transition duration-300 ease-in-out text-lg font-medium">
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition duration-300 ease-in-out shadow-lg text-lg font-medium"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="text-white hover:text-red-500 transition duration-300 ease-in-out text-lg font-medium">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition duration-300 ease-in-out shadow-lg text-lg font-medium">
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