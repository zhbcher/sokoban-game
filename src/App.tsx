// src/App.tsx
import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import './App.css';

const App: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showMenu, setShowMenu] = useState(true);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Record<number, number>>({});
  
  // 处理关卡完成
  const handleLevelComplete = (level: number, moves: number) => {
    setCompletedLevels(prev => {
      // 只有当前关卡没有完成记录，或者新的步数更少时才更新
      if (!prev[level] || moves < prev[level]) {
        return { ...prev, [level]: moves };
      }
      return prev;
    });
  };
  
  // 处理开始游戏
  const handleStartGame = () => {
    setShowMenu(false);
  };
  
  // 处理选择关卡
  const handleLevelSelect = () => {
    setShowLevelSelect(true);
    setShowMenu(false);
  };
  
  // 处理返回主菜单
  const handleBackToMenu = () => {
    setShowMenu(true);
    setShowLevelSelect(false);
  };
  
  // 处理选择特定关卡
  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setShowLevelSelect(false);
  };
  
  // 渲染主菜单
  const renderMainMenu = () => (
    <div className="main-menu">
      <h1>推箱子大师</h1>
      <div className="menu-buttons">
        <button onClick={handleStartGame}>开始游戏</button>
        <button onClick={handleLevelSelect}>选择关卡</button>
        <button onClick={() => window.open('https://github.com/yourusername/sokoban-game', '_blank')}>
          关于游戏
        </button>
      </div>
      <div className="game-description">
        <p>推箱子是一个经典的益智游戏，目标是将所有箱子推到目标点上。</p>
        <p>使用方向键或WASD移动角色，R键重置关卡，Z键撤销上一步。</p>
      </div>
    </div>
  );
  
  // 渲染关卡选择界面
  const renderLevelSelect = () => {
    // 生成可选关卡列表，最多显示已完成关卡+1
    const maxLevel = Math.max(
      ...Object.keys(completedLevels).map(Number),
      1
    ) + 1;
    
    const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);
    
    return (
      <div className="level-select">
        <h2>选择关卡</h2>
        <div className="level-grid">
          {levels.map(level => (
            <div 
              key={level}
              className={`level-item ${completedLevels[level] ? 'completed' : ''}`}
              onClick={() => handleSelectLevel(level)}
            >
              <div className="level-number">{level}</div>
              {completedLevels[level] && (
                <div className="level-moves">最佳步数: {completedLevels[level]}</div>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleBackToMenu} className="back-button">返回主菜单</button>
      </div>
    );
  };
  
  // 渲染游戏界面
  const renderGame = () => (
    <div className="game-screen">
      <GameBoard 
        initialLevel={currentLevel}
        onLevelComplete={handleLevelComplete}
      />
      <button onClick={handleBackToMenu} className="menu-button">
        返回主菜单
      </button>
    </div>
  );
  
  return (
    <div className="app">
      {showMenu && renderMainMenu()}
      {showLevelSelect && renderLevelSelect()}
      {!showMenu && !showLevelSelect && renderGame()}
    </div>
  );
};

export default App;
