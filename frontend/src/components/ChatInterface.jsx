import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from './UI/Button';

function ChatInterface({ levelId, level, user, onUserChange, onLevelComplete, onBack }) {
  const [dialogue, setDialogue] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [stage, setStage] = useState('chat'); // 'chat' | 'key' | 'done'
  const [enteredKey, setEnteredKey] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [shake, setShake] = useState(false);
  const shakeTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Fetch dialogue for this level
    fetch(`http://localhost:8000/levels/${levelId}/dialogue`)
      .then(res => res.json())
      .then(data => {
        const lines = Array.isArray(data) ? data : [];
        setDialogue(lines);

        // Reset stage when new dialogue arrives
        setCurrentLineIndex(0);
        setStage('chat');
        setEnteredKey('');
        setSubmitError(null);
        setSubmitting(false);
        setSubmitResult(null);
        setShowNextButton(false);
        setIsTyping(false);

        if (lines.length > 0) {
          startTyping(0, lines);
        }
      })
      .catch(err => console.error('Failed to load dialogue:', err));
  }, [levelId]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const startTyping = (index, linesOverride = null) => {
    const lines = Array.isArray(linesOverride) ? linesOverride : dialogue;
    if (index >= (lines?.length || 0)) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setIsTyping(true);
    setShowNextButton(false);

    // Simulate typing effect
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setShowNextButton(true);
    }, 1500); // 1.5 seconds typing effect
  };

  const handleNext = () => {
    const nextIndex = currentLineIndex + 1;

    if (nextIndex >= dialogue.length) {
      setShowNextButton(false);
      setIsTyping(false);
      setStage('key');
      return;
    }

    setCurrentLineIndex(nextIndex);
    startTyping(nextIndex);
  };

  const currentLine = dialogue[currentLineIndex];
  const isPlayerLine = currentLine && currentLine.speaker === 'player';

  const npcMeta = useMemo(() => {
    const firstNpc = (dialogue || []).find(l => l.speaker === 'npc');
    return {
      name: firstNpc?.character_name || 'Guide',
      title: firstNpc?.character_title || '',
    };
  }, [dialogue]);

  const safeCredits = user?.credits ?? 0;

  async function submitKey() {
    setSubmitError(null);
    const trimmed = (enteredKey || '').trim();
    if (!trimmed) {
      setSubmitError('Enter the key word first.');
      setShake(false);
      requestAnimationFrame(() => {
        setShake(true);
        shakeTimeoutRef.current = setTimeout(() => setShake(false), 520);
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8000/levels/${levelId}/submit-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, key: trimmed })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit key');

      setSubmitResult(data);
      if (!data.correct) {
        setSubmitError(data.message || 'Incorrect key');
        setShake(false);
        requestAnimationFrame(() => {
          setShake(true);
          shakeTimeoutRef.current = setTimeout(() => setShake(false), 520);
        });
        return;
      }

      // Update credits in global app state
      if (onUserChange) {
        onUserChange({ ...user, credits: data.new_credits });
      }

      setStage('done');
    } catch (e) {
      setSubmitError(e.message);
      setShake(false);
      requestAnimationFrame(() => {
        setShake(true);
        shakeTimeoutRef.current = setTimeout(() => setShake(false), 520);
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex flex-col">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-7px); }
          20%, 40%, 60%, 80% { transform: translateX(7px); }
        }
        .shake { animation: shake 0.52s ease-in-out; }

        @keyframes sparkle {
          0% { transform: translateY(0) scale(.6); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-60px) scale(1.25); opacity: 0; }
        }
        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: radial-gradient(circle, #fff 0%, #facc15 45%, rgba(250,204,21,0) 70%);
          animation: sparkle 1.1s ease-out infinite;
        }
      `}</style>
      {/* Header */}
      <div className="p-4 bg-black bg-opacity-50">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} className="bg-red-600 hover:bg-red-700">
            ← Back to Book
          </Button>
          <h2 className="text-2xl font-display text-treasure">
            {level?.title ? level.title : `Level ${levelId}`}
          </h2>
          <div className="text-treasure">
            Credits: {safeCredits}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-center p-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* Level Image + Character */}
          <div className="text-center mb-8">
            {level?.image && (
              <div className="max-w-2xl mx-auto mb-6">
                <div className="overflow-hidden rounded-xl border-2 border-treasure shadow-2xl">
                  <img
                    src={level.image}
                    alt={level.title || 'Level'}
                    className="w-full h-56 md:h-72 object-cover"
                  />
                </div>
              </div>
            )}
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-treasure">
              <span className="text-4xl">🗣️</span>
            </div>
            <h3 className="text-2xl font-display text-treasure mb-1">
              {npcMeta.name}
            </h3>
            <p className="text-amber-200">
              {npcMeta.title}
            </p>
          </div>

          {stage === 'chat' && (
            <>
              {/* Dialogue Box */}
              <div className="bg-black bg-opacity-70 rounded-lg p-6 border-2 border-treasure min-h-32 flex items-center">
                {currentLine ? (
                  <div className={`flex-1 ${isPlayerLine ? 'text-right' : 'text-left'}`}>
                    <div className="text-sm text-amber-400 mb-2">
                      {isPlayerLine ? 'You' : npcMeta.name}:
                    </div>
                    <div className="text-lg text-white leading-relaxed">
                      {isTyping ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        currentLine.text
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-amber-400">
                    Loading ancient wisdom...
                  </div>
                )}
              </div>

              {/* Next Button */}
              {showNextButton && (
                <div className="text-center mt-6">
                  <Button
                    onClick={handleNext}
                    className="bg-treasure hover:bg-yellow-600 text-black px-8 py-3 text-lg"
                  >
                    {currentLineIndex === dialogue.length - 1 ? 'Enter Key →' : 'Continue →'}
                  </Button>
                </div>
              )}
            </>
          )}

          {stage === 'key' && (
            <div className={`bg-black bg-opacity-70 rounded-2xl p-6 border-2 border-treasure shadow-2xl ${shake ? 'shake' : ''}`}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-yellow-300 shadow-lg">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h4 className="font-display text-2xl text-treasure">Temple Lock</h4>
                </div>
                <p className="text-amber-200 mb-6">
                  Enter the key word revealed in the dialogue.
                </p>

                <div className="max-w-md mx-auto">
                  <input
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitKey(); }}
                    placeholder="Example: HUMAN"
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900 text-white border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {submitError && (
                    <div className="mt-3 text-sm text-red-300 bg-red-900 bg-opacity-40 border border-red-700 rounded p-2">
                      {submitError}
                    </div>
                  )}
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                      onClick={() => { setStage('chat'); setShowNextButton(true); }}
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      ← Review Chat
                    </Button>
                    <Button
                      onClick={submitKey}
                      disabled={submitting}
                      className="bg-treasure hover:bg-yellow-600 text-black px-8"
                    >
                      {submitting ? 'Checking...' : 'Submit Key'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="relative bg-black bg-opacity-70 rounded-2xl p-6 border-2 border-treasure text-center shadow-2xl overflow-hidden">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    left: `${8 + (i * 6)}%`,
                    top: `${70 + (i % 3) * 8}%`,
                    animationDelay: `${(i % 7) * 0.12}s`,
                  }}
                />
              ))}
              <h4 className="font-display text-3xl text-treasure mb-2">Key Accepted!</h4>
              <p className="text-amber-200 mb-6">
                {submitResult?.reward_credits_awarded > 0
                  ? `You earned +${submitResult.reward_credits_awarded} credits.`
                  : 'Level already completed  no extra reward.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={onBack} className="bg-zinc-700 hover:bg-zinc-600">
                  Back to Book
                </Button>
                <Button
                  onClick={() => onLevelComplete(levelId, submitResult?.next_level_id || null)}
                  className="bg-treasure hover:bg-yellow-600 text-black px-8"
                >
                  {submitResult?.next_level_id ? 'Next Level →' : 'Finish'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;