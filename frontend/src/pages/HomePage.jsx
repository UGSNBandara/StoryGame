import React, { useState } from 'react';
import Button from '../components/UI/Button';
import Book from '../components/Book';

function HomePage({ user, onLogout }) {
  const [showCreditsPortal, setShowCreditsPortal] = useState(false);
  const [showProfilePortal, setShowProfilePortal] = useState(false);

  const handleLevelSelect = (levelId) => {
    alert(`Starting Level ${levelId}!`);
  };

  const levels = [
    {
      id: 1,
      title: "The Pyramids of Giza",
      description: "Enter the ancient pyramids and solve the riddle of the Sphinx to find your first sacred key.",
      image: "/src/assets/levels/pyramid.jpg"
    },
    {
      id: 2,
      title: "The Nile River",
      description: "Navigate the mighty Nile and uncover the secrets hidden in the river's ancient temples.",
      image: "/src/assets/levels/nile.jpg"
    },
    {
      id: 3,
      title: "The Valley of Kings",
      description: "Explore the tombs of pharaohs and decipher hieroglyphs to reveal the path forward.",
      image: "/src/assets/levels/valley.jpg"
    },
    {
      id: 4,
      title: "The Temple of Karnak",
      description: "Traverse the grand temple complex and solve the puzzle of the sacred obelisks.",
      image: "/src/assets/levels/karnak.jpg"
    },
    {
      id: 5,
      title: "The Final Chamber",
      description: "Face the ultimate challenge in the hidden chamber to repair your time machine.",
      image: "/src/assets/levels/chamber.jpg"
    }
  ];

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

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
      {/* Top Bar - Sticky */}
      <div className="sticky top-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700">
            Logout
          </Button>

          <h1 className="font-display text-4xl md:text-3xl text-white drop-shadow-lg absolute left-1/2 transform -translate-x-1/2">
            The Time Traveler's Escape
          </h1>

          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div
              className="flex items-center space-x-2 bg-treasure px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-600 transition-colors"
              onClick={() => setShowCreditsPortal(true)}
            >
              <span className="text-black font-display text-lg">{user.credits}</span>
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-bold">¢</span>
              </div>
            </div>

            {/* Profile Avatar */}
            <div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-treasure"
              onClick={() => setShowProfilePortal(true)}
            >
              <div className="w-full h-full flex items-center justify-center text-white font-display text-xl">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Magical Book */}
      <div className="relative z-10 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Book Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Book levels={levels} onLevelSelect={handleLevelSelect} user={user} />
        </div>

        {/* Static Footer Play Button */}
        <div className="sticky bottom-0 p-6">
          <div className="text-center">
            <Button
              className="bg-treasure hover:bg-yellow-600 text-black font-display text-2xl px-12 py-4 rounded-lg shadow-2xl border-2 border-yellow-400 transform hover:scale-105 transition-all duration-300"
              onClick={() => alert('Starting game...')}
            >
              Play Game
            </Button>
          </div>
        </div>
      </div>

      {/* Credits Portal */}
      {showCreditsPortal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-8 rounded-lg border-2 border-treasure max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-treasure">Credits Portal</h3>
              <button
                onClick={() => setShowCreditsPortal(false)}
                className="text-white hover:text-treasure text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-treasure rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-3xl font-bold">¢</span>
              </div>
              <div className="text-4xl font-display text-treasure mb-2">{user.credits}</div>
              <div className="text-white text-lg">Available Credits</div>
            </div>

            <div className="space-y-4">
              <Button className="w-full bg-treasure hover:bg-yellow-600 text-black">
                Add Coins
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Portal */}
      {showProfilePortal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-8 rounded-lg border-2 border-treasure max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-treasure">Profile</h3>
              <button
                onClick={() => setShowProfilePortal(false)}
                className="text-white hover:text-treasure text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-treasure">
                <span className="text-white text-4xl font-display">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-display text-white mb-2">{user.username}</div>
              <div className="text-treasure text-lg">Time Traveler</div>
            </div>

            <div className="mb-6">
              <h4 className="text-white text-lg mb-3">Progress</h4>
              <div className="bg-zinc-700 rounded-full h-4 mb-2">
                <div className="bg-treasure h-4 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="text-white text-sm">Level 2 of 5 • 40% Complete</div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default HomePage;