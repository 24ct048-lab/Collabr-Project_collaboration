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

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const promise = tab === 'register'
      ? registerUser({ name: name, email: email, password: password })
      : loginUser({ email: email, password: password });

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
        const msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Something went wrong';
        setError(msg);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Collabr</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Find your next dev collaborator</p>

        <div className="flex border border-gray-200 rounded-lg p-1 mb-6">
          <button
            onClick={function() { setTab('login'); setError(''); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Log In
          </button>
          <button
            onClick={function() { setTab('register'); setError(''); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={function(e) { setName(e.target.value); }}
                required
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={function(e) { setEmail(e.target.value); }}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={function(e) { setPassword(e.target.value); }}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Please wait…' : tab === 'register' ? 'Create Account' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
