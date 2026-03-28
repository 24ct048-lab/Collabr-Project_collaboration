import { useAtomValue, useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { feedAtom } from '../atoms/feedAtom';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const setFeed = useSetAtom(feedAtom);
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem('collabr_token');
    localStorage.removeItem('collabr_user');
    setUser(null);
    setFeed([]);
    navigate('/auth');
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(8, 9, 12, 0.8)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(184, 181, 255, 0.06)',
      padding: '0 2rem',
      height: '3.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/feed" style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: '1.1875rem',
        letterSpacing: '-0.04em',
        color: 'var(--on-surface)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.75rem',
          height: '1.75rem',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          boxShadow: '0 0 12px rgba(184, 181, 255, 0.3)',
        }}>⚡</span>
        Collabr
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {[
            { to: '/feed', label: 'Discover' },
            { to: '/ideas', label: 'Ideas' },
            { to: '/dashboard', label: 'Dashboard' },
          ].map(function(item) {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  position: 'relative',
                  padding: '0.4375rem 0.875rem',
                  borderRadius: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  background: active ? 'rgba(184, 181, 255, 0.08)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(184, 181, 255, 0.12)' : 'none',
                }}
              >
                {item.label}
                {active && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: '0.875rem',
                    right: '0.875rem',
                    height: '2px',
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-container))',
                    borderRadius: '99px',
                  }} />
                )}
              </Link>
            );
          })}

          <div style={{
            width: '1px',
            height: '1.25rem',
            background: 'rgba(60,68,85,0.5)',
            margin: '0 0.5rem',
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.625rem',
            background: 'var(--surface-container)',
            borderRadius: '2rem',
            border: '1px solid var(--outline-variant)',
          }}>
            <span style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-dim), var(--primary-container))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}>
              {user.name ? user.name[0].toUpperCase() : '?'}
            </span>
            <span style={{
              fontSize: '0.8125rem',
              color: 'var(--on-surface-variant)',
              fontWeight: 500,
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn-danger"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', marginLeft: '0.25rem' }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
