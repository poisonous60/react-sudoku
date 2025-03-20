import React, { useState, useEffect } from 'react';
import './App.css';
import Board from './components/Board.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import { supabase } from './utils/supabase.ts';
import { getCookie, setCookie } from './utils/cookies.ts';

type Difficulty = 'Very Easy' | 'Easy' | 'Normal' | 'Hard';
type MemoMode = 'select' | 'pencil' | 'eraser';

const DIFFICULTY_SETTINGS = {
  'Very Easy': { initialNumbers: 75 },
  'Easy': { initialNumbers: 55 },
  'Normal': { initialNumbers: 45 },
  'Hard': { initialNumbers: 35 }
};

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [lastPlayedDifficulty, setLastPlayedDifficulty] = useState<Difficulty>('Normal');
  const [memoMode, setMemoMode] = useState<MemoMode>('select');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (difficulty && !gameComplete) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [difficulty, gameComplete]);

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setLastPlayedDifficulty(selectedDifficulty);
    setGameComplete(false);
    setCompletionTime(null);
    setElapsedTime(0);
  };

  const handleGameComplete = async (time: number) => {
    setGameComplete(true);
    setCompletionTime(time);

    if (!difficulty) return;

    // 현재 난이도의 최고 기록 가져오기
    const bestTimeCookie = getCookie(`best_time_${difficulty}`);
    const bestTime = bestTimeCookie ? parseInt(bestTimeCookie) : Infinity;

    // 현재 기록이 더 좋으면 쿠키 업데이트하고 닉네임 입력 창 표시
    if (time < bestTime) {
      setCookie(`best_time_${difficulty}`, time.toString());
      setShowNicknameInput(true);
      setShowLeaderboard(false); // 최고 기록일 때는 리더보드 숨기기
    } else {
      // 최고 기록이 아니면 닉네임 입력 창만 숨기기
      setShowNicknameInput(false);
    }
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim() || !difficulty || !completionTime) return;

    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert([
          {
            nickname: nickname.trim(),
            difficulty,
            completion_time: completionTime,
          }
        ]);

      if (error) throw error;

      setShowNicknameInput(false);
      setShowLeaderboard(true); // 닉네임 입력 후에만 리더보드 표시
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleRestart = () => {
    setDifficulty(null);
    setGameComplete(false);
    setCompletionTime(null);
    setElapsedTime(0);
    setShowLeaderboard(false);
    setNickname('');
    setShowNicknameInput(false);
  };

  return (
    <div className="App">
      {!difficulty ? (
        <div className="difficulty-select">
          <h1>스도쿠 게임</h1>
          <div className="difficulty-buttons">
            <button onClick={() => handleDifficultySelect('Very Easy')}>Very Easy</button>
            <button onClick={() => handleDifficultySelect('Easy')}>Easy</button>
            <button onClick={() => handleDifficultySelect('Normal')}>Normal</button>
            <button onClick={() => handleDifficultySelect('Hard')}>Hard</button>
          </div>
          <button 
            className="leaderboard-button"
            onClick={() => setShowLeaderboard(true)}
          >
            리더보드 보기
          </button>
          {showLeaderboard && (
            <Leaderboard 
              onClose={() => setShowLeaderboard(false)} 
              initialDifficulty={lastPlayedDifficulty}
            />
          )}
        </div>
      ) : (
        <>
          <div className="game-info">
            <div>난이도: {difficulty}</div>
            <div>경과 시간: {elapsedTime}초</div>
            {(() => {
              const bestTime = getCookie(`best_time_${difficulty}`);
              return bestTime ? <div>최고 기록: {bestTime}초</div> : null;
            })()}
          </div>
          <div className="memo-tools">
            <button 
              className={`memo-tool ${memoMode === 'select' ? 'active' : ''}`}
              onClick={() => setMemoMode('select')}
              title="선택 모드"
            >
              🖱️
            </button>
            <button 
              className={`memo-tool ${memoMode === 'pencil' ? 'active' : ''}`}
              onClick={() => setMemoMode('pencil')}
              title="메모 모드"
            >
              ✏️
            </button>
            <button 
              className={`memo-tool ${memoMode === 'eraser' ? 'active' : ''}`}
              onClick={() => setMemoMode('eraser')}
              title="지우개 모드"
            >
              👝
            </button>
          </div>
          <Board
            onGameComplete={handleGameComplete}
            initialNumbers={DIFFICULTY_SETTINGS[difficulty].initialNumbers}
            memoMode={memoMode}
          />
          {gameComplete && (
            <div className="overlay">
              <div className="congratulations">
                <h2>축하합니다!</h2>
                <p>완료 시간: {completionTime}초</p>
                {showNicknameInput ? (
                  <div>
                    <input
                      type="text"
                      placeholder="닉네임을 입력하세요"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                    />
                    <button onClick={handleNicknameSubmit}>제출</button>
                  </div>
                ) : (
                  <button onClick={handleRestart}>나가기</button>
                )}
              </div>
            </div>
          )}
          {showLeaderboard && (
            <Leaderboard 
              onClose={() => setShowLeaderboard(false)} 
              initialDifficulty={difficulty}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App; 