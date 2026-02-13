import React, { useState } from 'react';
import { API_URL } from '../../config';

function LoginRegister({ onLogin, onRegister, error, setError, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      if (isLogin) onLogin({ ...data, email, username });
      else onRegister({ ...data, email, username });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative bg-black bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-treasure max-w-md w-full mx-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white hover:text-treasure transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10"
      >
        ✕
      </button>

      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-treasure mb-2">Enter the Portal</h2>
        <p className="text-sm text-gray-300 mb-6">Begin journey through time</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Email</label>
          <input
            className="input-field bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Username :</label>
          <input
            className="input-field bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button-gold w-full" disabled={loading}>
          {loading ? 'Opening...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
        >
          {isLogin ? 'Need to register?' : 'Already have an account? Login'}
        </button>
      </div>
      {error && <div className="mt-4 text-sm text-red-400 bg-red-900 bg-opacity-50 p-2 rounded">{error}</div>}
    </div>
  );
}

export default LoginRegister;