
import React, { useState } from 'react';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  function handleLogin(u) {
    setUser(u);
    setError(null);
  }
  function handleRegister(u) {
    setUser(u);
    setError(null);
  }
  function handleLogout() {
    setUser(null);
    setError(null);
  }

  return (
    <div>
      {!user ? (
        <OnboardingPage onLogin={handleLogin} onRegister={handleRegister} error={error} setError={setError} />
      ) : (
        <HomePage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
