import { useAtomValue, useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { feedAtom } from '../atoms/feedAtom';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const setFeed = useSetAtom(feedAtom);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('collabr_token');
    localStorage.removeItem('collabr_user');
    setUser(null);
    setFeed([]);
    navigate('/auth');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/feed" className="text-xl font-bold text-indigo-600 tracking-tight">
        Collabr
      </Link>

      {user && (
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/feed" className="hover:text-indigo-600 transition-colors">
            Feed
          </Link>
          <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-gray-800">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
