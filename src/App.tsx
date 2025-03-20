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

// 스도쿠 보드 생성 함수
const generateSudokuBoard = (initialNumbers: number): number[][] => {
  // 기본 9x9 보드 생성
  const board = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // 첫 번째 3x3 박스에 1-9 숫자 무작위 배치
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      board[i][j] = numbers.splice(randomIndex, 1)[0];
    }
  }

  // 나머지 셀에 숫자 채우기
  const solveSudoku = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solveSudoku(board);

  // 일부 숫자 제거
  const cells = 81 - initialNumbers;
  const positions = Array.from({ length: 81 }, (_, i) => i);
  for (let i = 0; i < cells; i++) {
    const randomIndex = Math.floor(Math.random() * positions.length);
    const pos = positions.splice(randomIndex, 1)[0];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    board[row][col] = 0;
  }

  return board;
};

// 유효성 검사 함수
const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
  // 행 검사
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) return false;
  }

  // 열 검사
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === num) return false;
  }

  // 3x3 박스 검사
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = startRow + i;
      const currentCol = startCol + j;
      if (currentRow !== row && currentCol !== col && board[currentRow][currentCol] === num) return false;
    }
  }

  return true;
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
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isInvalid, setIsInvalid] = useState<boolean[][]>([]);
  const [memoNumbers, setMemoNumbers] = useState<{ [key: string]: number[] }>({});

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
    
    // 난이도에 따른 초기 숫자 개수 설정
    const initialNumbers = DIFFICULTY_SETTINGS[selectedDifficulty].initialNumbers;
    
    // 스도쿠 보드 생성
    const newBoard = generateSudokuBoard(initialNumbers);
    setBoard(newBoard);
    setInitialBoard(newBoard.map(row => [...row])); // 깊은 복사
    setIsInvalid(Array(9).fill(0).map(() => Array(9).fill(false)));
    setMemoNumbers({}); // 메모 숫자 초기화
  };

  const handleCellClick = (row: number, col: number) => {
    // 초기 숫자는 수정할 수 없음
    if (initialBoard[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  const handleMemoNumberClick = (row: number, col: number, num: number) => {
    // 초기 숫자는 수정할 수 없음
    if (initialBoard[row][col] !== 0) return;

    const key = `${row}-${col}`;
    
    // 지우개 모드일 때는 모든 메모 숫자를 지움
    if (memoMode === 'eraser') {
      setMemoNumbers(prev => ({
        ...prev,
        [key]: []
      }));
      return;
    }
    
    // 메모 모드일 때는 기존 로직대로 동작
    const currentMemos = memoNumbers[key] || [];
    let newMemos: number[];
    if (currentMemos.includes(num)) {
      newMemos = currentMemos.filter(n => n !== num);
    } else {
      newMemos = [...currentMemos, num];
    }
    
    setMemoNumbers(prev => ({
      ...prev,
      [key]: newMemos
    }));
  };

  const handleMemoChange = (row: number, col: number, memo: number) => {
    // 초기 숫자는 수정할 수 없음
    if (initialBoard[row][col] !== 0) return;
    
    const newBoard = [...board];
    newBoard[row][col] = memo;
    setBoard(newBoard);

    // 유효성 검사
    const newIsInvalid = [...isInvalid];
    if (memo !== 0) {
      // 현재 입력된 숫자가 유효한지 검사
      const isValidMove = isValid(newBoard, row, col, memo);
      newIsInvalid[row][col] = !isValidMove;
    } else {
      newIsInvalid[row][col] = false;
    }
    setIsInvalid(newIsInvalid);

    // 게임 완료 체크
    const isComplete = newBoard.every((row, rowIndex) => 
      row.every((cell, colIndex) => {
        if (initialBoard[rowIndex][colIndex] !== 0) return true;
        return cell !== 0 && isValid(newBoard, rowIndex, colIndex, cell);
      })
    );

    if (isComplete) {
      handleGameComplete(elapsedTime);
    }
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
            board={board}
            initialBoard={initialBoard}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
            memoMode={memoMode}
            onMemoChange={handleMemoChange}
            isInvalid={isInvalid}
            memoNumbers={memoNumbers}
            onMemoNumberClick={handleMemoNumberClick}
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