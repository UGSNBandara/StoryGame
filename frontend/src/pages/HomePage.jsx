import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/UI/Button';
import Book from '../components/Book';
import LevelScene from '../components/LevelScene';

function HomePage({ user, onUserChange, onLogout }) {
  const [showCreditsPortal, setShowCreditsPortal] = useState(false);
  const [showProfilePortal, setShowProfilePortal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);

  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState(null);

  const imageByLevelNumber = useMemo(() => ({
    1: '/src/assets/levels/pyramid.jpg',
    2: '/src/assets/levels/nile.jpg',
    3: '/src/assets/levels/valley.jpg',
    4: '/src/assets/levels/karnak.jpg',
    5: '/src/assets/levels/chamber.jpg',
  }), []);

  async function refreshProgress() {
    try {
      const res = await fetch(`http://localhost:8000/users/${user.id}/progress`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load progress');
      setProgress(data);
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/levels');
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to load levels');
        const withImages = (data || []).map(l => ({
          ...l,
          image: imageByLevelNumber[l.level_number],
        }));
        setLevels(withImages);
      } catch (e) {
        console.error(e);
      }
    })();

    refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const completedLevelIds = useMemo(() => {
    const set = new Set();
    (progress?.levels || []).forEach(l => {
      if (l.completed) set.add(l.id);
    });
    return set;
  }, [progress]);

  const unlockedLevelNumbers = useMemo(() => {
    const nextNum = progress?.next_unlocked_level_number || 1;
    const set = new Set();
    for (let i = 1; i <= nextNum; i++) set.add(i);
    return set;
  }, [progress]);

  const handleLevelSelect = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevel(level);
    }
  };

  const handleLevelComplete = async (levelId, nextLevelId = null) => {
    setCurrentLevel(null);
    await refreshProgress();
    if (nextLevelId) {
      const next = levels.find(l => l.id === nextLevelId);
      if (next) setCurrentLevel(next);
    }
  };

  const handleBackToBook = () => {
    setCurrentLevel(null);
  };

  const safeCredits = user?.credits ?? 0;

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
              <span className="text-black font-display text-lg">{safeCredits}</span>
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
        {currentLevel ? (
          <LevelScene
            level={currentLevel}
            user={user}
            onUserChange={onUserChange}
            onBack={handleBackToBook}
            onLevelComplete={handleLevelComplete}
          />
        ) : (
          <>
            {/* Book Container */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
              <div className="w-full max-w-5xl bg-black bg-opacity-60 border border-yellow-800 rounded-3xl shadow-2xl backdrop-blur-sm p-4 md:p-8">
                <div className="mb-4 text-center text-amber-100">
                  <h2 className="font-display text-2xl md:text-3xl text-treasure mb-1">
                    Choose Your Chapter
                  </h2>
                  <p className="text-sm md:text-base">
                    Flip through the ancient tome and enter a level to begin your adventure.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Book
                    levels={levels}
                    onLevelSelect={handleLevelSelect}
                    user={user}
                    unlockedLevelNumbers={unlockedLevelNumbers}
                    completedLevelIds={completedLevelIds}
                  />
                </div>
              </div>
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
          </>
        )}
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
              <div className="text-4xl font-display text-treasure mb-2">{safeCredits}</div>
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