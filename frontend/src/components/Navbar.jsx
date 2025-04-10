import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      const name = localStorage.getItem('name') || 'User';
      setIsAuthenticated(!!token);
      setRole(userRole);
      setUserName(name);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setIsAuthenticated(false);
    setRole(null);
    setUserName('');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">FitClub</Link>
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              {role === 'Owner' && (
                <Link to="/owner-dashboard" className="text-white hover:text-blue-200 transition duration-300">
                  Owner Dashboard
                </Link>
              )}
              {role === 'Gym' && (
                <>
                  <Link to="/gym-owner-dashboard" className="text-white hover:text-blue-200 transition duration-300">
                    Gym Dashboard
                  </Link>
                  <Link to="/my-gym" className="text-white hover:text-blue-200 transition duration-300">
                    My Gym
                  </Link>
                </>
              )}
              {role === 'Trainer' && (
                <Link to="/trainer-dashboard" className="text-white hover:text-blue-200 transition duration-300">
                  Trainer Dashboard
                </Link>
              )}
              {role === 'Member' && (
                <Link to="/member-dashboard" className="text-white hover:text-blue-200 transition duration-300">
                  Member Dashboard
                </Link>
              )}
              <span className="text-white">{userName}</span>
              <button
                onClick={handleLogout}
                className="text-white hover:text-blue-200 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-white hover:text-blue-200 transition duration-300">
                Signup
              </Link>
              <Link to="/login" className="text-white hover:text-blue-200 transition duration-300">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;