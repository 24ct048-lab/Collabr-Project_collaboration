import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { userAtom } from '../atoms/userAtom';
import { registerUser, loginUser } from '../api/index';

function AuthPage() {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();

  function switchTab(newTab) {
    setError('');
    setTab(newTab);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const promise = tab === 'register'
      ? registerUser({ name: name.trim(), email: email.trim(), password: password })
      : loginUser({ email: email.trim(), password: password });

    promise
      .then(function(res) {
        const token = res.data.token;
        const user = res.data.user;
        localStorage.setItem('collabr_token', token);
        localStorage.setItem('collabr_user', JSON.stringify(user));
        setUser(user);
        navigate('/feed');
      })
      .catch(function(err) {
        let msg = 'Something went wrong. Check that the server is running.';
        if (err.response && err.response.data && err.response.data.error) {
          msg = err.response.data.error;
        } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          msg = 'Cannot connect to server. Make sure the backend is running on port 5000.';
        }
        setError(msg);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(255, 117, 89, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(255, 77, 77, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Auth card */}
      <div className="animate-scale-in" style={{
        position: 'relative',
        background: 'var(--surface-container)',
        borderRadius: '1.5rem',
        padding: '2.75rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-float)',
        border: '1px solid rgba(255, 77, 77, 0.06)',
      }}>
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="animate-float" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            borderRadius: '0.875rem',
            fontSize: '1.375rem',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(255, 77, 77, 0.4)',
          }}>⚡</div>
          <h1 style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--on-surface)',
            letterSpacing: '-0.04em',
            margin: 0,
            lineHeight: 1.1,
          }}>Collabr</h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--secondary)',
            marginTop: '0.5rem',
            lineHeight: 1.5,
          }}>Find your next dev collaborator</p>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-highest)',
          borderRadius: '0.875rem',
          padding: '0.25rem',
          marginBottom: '1.75rem',
          gap: '0.25rem',
        }}>
          {['login', 'register'].map(function(t) {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={function() { switchTab(t); }}
                style={{
                  flex: 1,
                  padding: '0.5625rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  background: active
                    ? 'linear-gradient(135deg, var(--primary), var(--primary-container))'
                    : 'transparent',
                  color: active ? 'white' : 'var(--secondary)',
                  fontFamily: "'Satoshi', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
                  boxShadow: active ? '0 4px 12px rgba(255,77,77,0.35)' : 'none',
                  letterSpacing: '0.01em',
                }}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name field (register only) */}
          <div style={{
            marginBottom: '1.25rem',
            overflow: 'hidden',
            maxHeight: tab === 'register' ? '90px' : '0',
            opacity: tab === 'register' ? 1 : 0,
            transition: 'max-height 0.35s ease, opacity 0.25s ease',
            pointerEvents: tab === 'register' ? 'auto' : 'none',
          }}>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={function(e) { setName(e.target.value); }}
              required={tab === 'register'}
              placeholder="Your full name"
              className="input-field"
              tabIndex={tab === 'register' ? 0 : -1}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={function(e) { setEmail(e.target.value); }}
              required
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={function(e) { setPassword(e.target.value); }}
              required
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          {/* Error */}
          <div style={{ minHeight: '2.25rem', marginBottom: '1rem' }}>
            {error && (
              <div style={{
                background: 'var(--error-dim)',
                color: 'var(--error)',
                borderRadius: '0.75rem',
                padding: '0.625rem 0.9375rem',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                border: '1px solid rgba(248, 113, 113, 0.2)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}>
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.8125rem',
              borderRadius: '0.875rem',
              fontSize: '0.9375rem',
              background: loading
                ? 'var(--surface-highest)'
                : undefined,
              color: loading ? 'var(--secondary)' : undefined,
              boxShadow: loading ? 'none' : undefined,
            }}
          >
            {loading
              ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Please wait…</>
              : tab === 'register' ? '✦ Create Account' : 'Log In →'
            }
          </button>
        </form>

        {/* Footer hint */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--secondary)',
          marginTop: '1.25rem',
        }}>
          {tab === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '
          }
          <button
            type="button"
            onClick={function() { switchTab(tab === 'login' ? 'register' : 'login'); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary-dim)',
              fontWeight: 600,
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            {tab === 'login' ? 'Sign up now' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
