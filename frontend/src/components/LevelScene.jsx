import React from 'react';
import ChatInterface from './ChatInterface';

function LevelScene({ level, user, onUserChange, onBack, onLevelComplete }) {
  return (
    <ChatInterface
      levelId={level.id}
      user={user}
      onUserChange={onUserChange}
      level={level}
      onLevelComplete={onLevelComplete}
      onBack={onBack}
    />
  );
}

export default LevelScene;