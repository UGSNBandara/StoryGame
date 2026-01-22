import React, { useState, useRef, useEffect } from 'react';

const ANIMATION_DURATION = 800; // ms

// Book component with realistic single flipping page (front/back) like turn.js
const Book = ({ levels, onLevelSelect, unlockedLevelNumbers, completedLevelIds }) => {
  const [currentPage, setCurrentPage] = useState(0); // index of right page
  const [bookOpen, setBookOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' | 'prev'
  const [flipFaces, setFlipFaces] = useState({ front: null, back: null });
  const flipTimeoutRef = useRef(null);

  // Derived indexes
  const leftPageIndex = currentPage - 1; // may be -1 (cover)
  const rightPageIndex = currentPage; // current visible right page

  const openBook = () => {
    if (!bookOpen) setBookOpen(true);
  };

  const startFlip = (direction) => {
    if (isFlipping) return;
    if (direction === 'next' && currentPage >= levels.length - 1) return;
    if (direction === 'prev' && currentPage <= 0) return;

    // Determine faces (front shows current, back shows target)
    if (direction === 'next') {
      setFlipFaces({
        front: rightPageIndex, // current right page face
        back: rightPageIndex + 1 // next page that becomes new right
      });
    } else {
      // Flipping previous page from left side to become right
      setFlipFaces({
        front: leftPageIndex, // previous left page front
        back: currentPage // current right page becomes back
      });
    }

    setFlipDirection(direction);
    setIsFlipping(true);

    flipTimeoutRef.current = setTimeout(() => {
      setCurrentPage(prev => direction === 'next' ? prev + 1 : prev - 1);
      setIsFlipping(false);
      setFlipDirection(null);
      setFlipFaces({ front: null, back: null });
    }, ANIMATION_DURATION);
  };

  useEffect(() => () => clearTimeout(flipTimeoutRef.current), []);

  const isUnlocked = (level) => {
    if (!level) return false;
    if (!unlockedLevelNumbers) return true;
    const levelNumber = level.level_number ?? level.id;
    return unlockedLevelNumbers.has(levelNumber);
  };

  const isCompleted = (level) => {
    if (!level) return false;
    if (!completedLevelIds) return false;
    return completedLevelIds.has(level.id);
  };

  const handleLevelEnter = (level) => {
    if (!level) return;
    if (!isUnlocked(level)) return;
    onLevelSelect && onLevelSelect(level.id);
  };

  return (
    <>
      <style>{`
        .book-container { position: relative; width:800px; height:500px; perspective:1600px; }
        .book-shell { position:relative; width:100%; height:100%; }
        .page-base { width:400px; height:100%; position:absolute; top:0; overflow:hidden; background:linear-gradient(135deg,#f8f5e9,#fffbea,#f8f5e9); border:1px solid #d2b48c; box-shadow:inset 0 0 6px rgba(0,0,0,.15); }
        .page-left { left:0; border-radius:6px 0 0 6px; }
        .page-right { left:400px; border-radius:0 6px 6px 0; }
        .page-content { position:relative; width:100%; height:100%; padding:24px 28px; box-sizing:border-box; font-family:'Cinzel',serif; display:flex; flex-direction:column; }
        .page-content h3 { margin:0 0 8px; font-size:24px; color:#7a4a10; }
        .page-content p { flex:1; font-size:14px; line-height:1.4; color:#4d330d; }
        .page-content button { align-self:center; background:#8b4513; color:#fff; border:1px solid #d7b066; padding:8px 16px; border-radius:4px; cursor:pointer; font-family:'Cinzel',serif; transition:.25s; }
        .page-content button:disabled { opacity:.45; cursor:not-allowed; }
        .page-content button:not(:disabled):hover { background:#69340f; }
        .stack-page { pointer-events:none; }

        /* Flipping page */
        .flip-wrapper { position:absolute; top:0; left:400px; width:400px; height:100%; transform-style:preserve-3d; }
        /* For prev flip we shift wrapper to spine */
        .flip-prev { left:0; }
        .flip-page { position:absolute; inset:0; transform-style:preserve-3d; }
        .flip-face { position:absolute; inset:0; backface-visibility:hidden; background:linear-gradient(135deg,#f8f5e9,#fffbea,#f8f5e9); border:1px solid #d2b48c; overflow:hidden; }
        .flip-face.back { transform:rotateY(180deg); }
        .shadow-overlay { position:absolute; inset:0; pointer-events:none; background:linear-gradient(90deg,rgba(0,0,0,.25),rgba(0,0,0,0) 35%,rgba(0,0,0,0) 65%,rgba(0,0,0,.25)); opacity:0; transition:opacity .3s; }
        .flipping .shadow-overlay { opacity:1; }

        /* Animations */
        @keyframes flip-next { 0%{ transform:rotateY(0deg);} 100%{ transform:rotateY(-180deg);} }
        @keyframes flip-prev { 0%{ transform:rotateY(0deg);} 100%{ transform:rotateY(180deg);} }
        .animate-next { animation:flip-next ${ANIMATION_DURATION}ms cubic-bezier(.77,.02,.18,1); transform-origin:left center; }
        .animate-prev { animation:flip-prev ${ANIMATION_DURATION}ms cubic-bezier(.77,.02,.18,1); transform-origin:right center; }

        /* Cover */
        .cover { position:absolute; inset:0; background:linear-gradient(135deg,#2d1810,#4a2c1a,#2d1810); border:3px solid #d4a038; border-radius:8px; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#e6c376; cursor:pointer; box-shadow:0 12px 28px rgba(0,0,0,.45); transform-origin:left center; transition:transform .9s cubic-bezier(.77,.02,.18,1); }
        .cover.open { transform:rotateY(-140deg); }
        .spine { position:absolute; top:0; left:398px; width:4px; height:100%; background:linear-gradient(#5e3a17,#8b5a2b,#5e3a17); z-index:5; }
        .book-container.open .spine { box-shadow:0 0 12px rgba(255,215,0,.35); }

        .hint { position:absolute; bottom:12px; font-size:12px; opacity:.75; }
      `}</style>

      <div className={`book-container ${bookOpen ? 'open' : ''}`}>
        <div className="spine" />
        {!bookOpen && (
          <div className={`cover ${bookOpen ? 'open' : ''}`} onClick={openBook}>
            <h2 style={{
              margin:0,
              fontFamily:'Cinzel',
              letterSpacing:'2px',
              fontSize:'48px',
              fontWeight:'bold',
              textShadow:'2px 2px 4px rgba(0,0,0,0.8)',
              marginBottom:'16px'
            }}>
              Ancient Chronicles
            </h2>
            <div style={{
              fontSize:'14px',
              opacity:0.8,
              fontStyle:'italic',
              letterSpacing:'0.5px'
            }}>
              Click to Open
            </div>
          </div>
        )}

        {bookOpen && (
          <div className={`book-shell ${isFlipping ? 'flipping' : ''}`}>
            {/* Left static page (previous) */}
            <div className="page-base page-left" style={{ zIndex:1 }}>
              <div className="page-content">
                {leftPageIndex >= 0 ? (
                  <>
                    <h3>{levels[leftPageIndex].title}</h3>
                    <p>{levels[leftPageIndex].description}</p>
                    <button disabled={isFlipping || currentPage <= 0} onClick={() => startFlip('prev')}>← Previous</button>
                  </>
                ) : (
                  <>
                    <h3>Prologue</h3>
                    <p>The journey begins. Turn the page →</p>
                    <button disabled style={{ opacity:.4 }}>← Previous</button>
                  </>
                )}
              </div>
            </div>

            {/* Right static page (current) */}
            <div className="page-base page-right" style={{ zIndex:1 }}>
              <div className="page-content">
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12 }}>
                  <h3 style={{ marginBottom:0 }}>{levels[rightPageIndex].title}</h3>
                  <div
                    style={{
                      fontSize:12,
                      color: isCompleted(levels[rightPageIndex]) ? '#14532d' : '#7a4a10',
                      opacity: .95,
                      background: isCompleted(levels[rightPageIndex]) ? 'rgba(34,197,94,.18)' : 'rgba(122,74,16,.10)',
                      border: isCompleted(levels[rightPageIndex]) ? '1px solid rgba(34,197,94,.35)' : '1px solid rgba(122,74,16,.20)',
                      padding: '4px 8px',
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isCompleted(levels[rightPageIndex]) ? (
                      <>
                        <span style={{ fontSize: 14 }}>🔑</span>
                        <span>Key Collected</span>
                      </>
                    ) : (
                      <span>{isUnlocked(levels[rightPageIndex]) ? 'Unlocked' : 'Locked'}</span>
                    )}
                  </div>
                </div>

                {/* Level Illustration between title and text */}
                {levels[rightPageIndex].image && (
                  <div style={{ flex:'0 0 auto', marginBottom:12 }}>
                    <div
                      style={{
                        width:'100%',
                        height:160,
                        borderRadius:6,
                        overflow:'hidden',
                        boxShadow:'0 6px 14px rgba(0,0,0,.35)',
                        border:'1px solid rgba(122,74,16,.45)',
                        backgroundColor:'#1f2937',
                      }}
                    >
                      <img
                        src={levels[rightPageIndex].image}
                        alt={levels[rightPageIndex].title}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      />
                    </div>
                  </div>
                )}

                <p>{levels[rightPageIndex].description}</p>

                <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:8 }}>
                  <button
                    disabled={!isUnlocked(levels[rightPageIndex])}
                    onClick={() => handleLevelEnter(levels[rightPageIndex])}
                  >
                    {isUnlocked(levels[rightPageIndex]) ? 'Enter' : 'Locked'}
                  </button>
                  <button
                    disabled={isFlipping || currentPage >= levels.length - 1}
                    onClick={() => startFlip('next')}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Stacked previews (optional subtle depth) */}
            {Array.from({ length: Math.min(2, levels.length - rightPageIndex - 1) }).map((_, i) => (
              <div key={`stack-r-${i}`} className="page-base page-right stack-page" style={{ left:400 + i*2, top:i*2, opacity:.35 - i*0.15, zIndex:0 }} />
            ))}
            {Array.from({ length: Math.min(2, leftPageIndex) }).map((_, i) => (
              <div key={`stack-l-${i}`} className="page-base page-left stack-page" style={{ left:-i*2, top:i*2, opacity:.35 - i*0.15, zIndex:0 }} />
            ))}

            {/* Flipping page overlay */}
            {isFlipping && (
              <div className={`flip-wrapper ${flipDirection === 'prev' ? 'flip-prev' : ''}`} style={{ zIndex:5 }}>
                <div className={`flip-page ${flipDirection === 'next' ? 'animate-next' : 'animate-prev'}`}>
                  <div className="flip-face front">
                    {flipFaces.front != null && (
                      <div className="page-content">
                        <h3>{levels[flipFaces.front].title}</h3>
                        <p>{levels[flipFaces.front].description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flip-face back">
                    {flipFaces.back != null && (
                      <div className="page-content">
                        <h3>{levels[flipFaces.back].title}</h3>
                        <p>{levels[flipFaces.back].description}</p>
                      </div>
                    )}
                  </div>
                  <div className="shadow-overlay" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Book;