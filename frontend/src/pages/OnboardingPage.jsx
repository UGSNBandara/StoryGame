import React, { useState } from 'react';
import LoginRegister from '../components/Auth/LoginRegister';

function OnboardingPage({ onLogin, onRegister, error, setError }) {
  const [showPortal, setShowPortal] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/src/assets/loopvideo/BackLogin.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Video Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Background Story Text - Positioned at top */}
      <div className="absolute top-16 left-0 right-0 text-center text-white px-4 z-10">
        <h1 className="font-display text-3xl md:text-5xl mb-4 text-treasure drop-shadow-lg">
          The Time Traveler's Escape
        </h1>
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-4">
          Stranded in Ancient Egypt, gather the 5 sacred keys to repair your time machine and return home.
        </p>
      </div>

      {/* Enter Portal Button - Bottom */}
      {!showPortal && (
        <div className="absolute inset-0 flex items-end justify-center z-20 pb-12">
          <button
            onClick={() => setShowPortal(true)}
            className="bg-treasure hover:bg-yellow-600 text-black font-display text-xl px-4 py-2 rounded-lg shadow-2xl border-2 border-yellow-400 transform hover:scale-105 transition-all duration-300"
          >
            Enter the Portal
          </button>
        </div>
      )}

      {/* Overlay Portal - Centered */}
      {showPortal && (
        <div className="relative z-20 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md mx-4">
            <LoginRegister
              onLogin={onLogin}
              onRegister={onRegister}
              error={error}
              setError={setError}
              onClose={() => setShowPortal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OnboardingPage;