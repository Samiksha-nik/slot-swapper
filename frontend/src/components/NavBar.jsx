import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 border-b-2 ${isActive ? 'border-blue-600 text-blue-700 dark:text-blue-400 font-semibold' : 'border-transparent text-gray-700 dark:text-gray-200'}`;

  return (
    <nav className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🔁</span>
          <span>Slot Swapper</span>
        </NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink>
          <NavLink to="/requests" className={linkClass}>Requests</NavLink>
          <DarkModeToggle />
          {isAuthenticated && (
            <div className="ml-2 relative group">
              <button className="px-3 py-2 text-sm rounded bg-gray-900 text-white hover:bg-gray-800">Account ▾</button>
              <div className="absolute right-0 mt-1 hidden group-hover:block bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md min-w-[180px]">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


