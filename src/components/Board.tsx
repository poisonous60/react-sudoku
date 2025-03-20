import React, { useState, useEffect } from 'react';
import Cell from './Cell.tsx';
import { isValidNumber, generateSudoku, isBoardComplete } from '../utils/sudoku.ts';

interface BoardProps {
  onGameComplete: (time: number) => void;
  initialNumbers: number;
  memoMode: 'select' | 'pencil' | 'eraser';
}

const Board: React.FC<BoardProps> = ({ onGameComplete, initialNumbers, memoMode }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [memoNumbers, setMemoNumbers] = useState<{ [key: string]: number[] }>({});

  useEffect(() => {
    const { board: newBoard, initialBoard: newInitialBoard } = generateSudoku(initialNumbers);
    setBoard(newBoard);
    setInitialBoard(newInitialBoard);
    setStartTime(Date.now());
    setIsComplete(false);
    setSelectedCell(null);
    setMemoNumbers({});

    // // 테스트: 게임 시작 시 바로 완료 효과
    // setIsComplete(true);
    // onGameComplete(0);
  }, [initialNumbers]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== 0) return;

    if (memoMode === 'pencil') {
      setSelectedCell({ row, col });
      const cellKey = `${row}-${col}`;
      if (!memoNumbers[cellKey]) {
        setMemoNumbers(prev => ({
          ...prev,
          [cellKey]: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        }));
      }
    } else if (memoMode === 'eraser') {
      const cellKey = `${row}-${col}`;
      setMemoNumbers(prev => {
        const newMemoNumbers = { ...prev };
        delete newMemoNumbers[cellKey];
        return newMemoNumbers;
      });
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleMemoNumberClick = (row: number, col: number, number: number) => {
    if (memoMode === 'pencil') {
      const cellKey = `${row}-${col}`;
      setMemoNumbers(prev => {
        const currentNumbers = prev[cellKey] || [];
        const newNumbers = currentNumbers.includes(number)
          ? currentNumbers.filter(n => n !== number)
          : [...currentNumbers, number];
        
        return {
          ...prev,
          [cellKey]: newNumbers
        };
      });
    } else if (memoMode === 'eraser') {
      // 지우개 모드일 때는 모든 메모 숫자를 지움
      const cellKey = `${row}-${col}`;
      setMemoNumbers(prev => ({
        ...prev,
        [cellKey]: []
      }));
    }
  };

  const handleCellChange = (row: number, col: number, value: number) => {
    if (initialBoard[row][col] !== 0) return;
    
    // 현재 입력하려는 숫자가 유효한지 먼저 확인
    const isValid = isValidNumber(board, row, col, value);
    
    const newBoard = [...board];
    newBoard[row][col] = value;
    setBoard(newBoard);
    
    // 모든 칸이 채워졌는지 확인
    const isAllFilled = newBoard.every(row => row.every(cell => cell !== 0));
    
    // 모든 칸이 채워졌고 현재 입력한 숫자가 유효하다면 완료 체크
    if (isAllFilled && isValid) {
      // 모든 칸이 유효한지 한 번 더 확인
      const isAllValid = newBoard.every((r, i) => 
        r.every((cell, j) => {
          // 현재 셀의 값을 임시로 제거하고 유효성 검사
          const tempValue = newBoard[i][j];
          newBoard[i][j] = 0;
          const isValidCell = isValidNumber(newBoard, i, j, tempValue);
          newBoard[i][j] = tempValue;
          return isValidCell;
        })
      );
      
      if (isAllValid) {
        setIsComplete(true);
        const endTime = Date.now();
        const timeInSeconds = Math.floor((endTime - startTime) / 1000);
        onGameComplete(timeInSeconds);
      }
    }
  };

  const hasDuplicateInRow = (row: number, col: number, value: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] === value) return true;
    }
    return false;
  };

  const hasDuplicateInCol = (row: number, col: number, value: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][col] === value) return true;
    }
    return false;
  };

  const hasDuplicateInBox = (row: number, col: number, value: number): boolean => {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = boxRow + i;
        const currentCol = boxCol + j;
        if (currentRow !== row && currentCol !== col && board[currentRow][currentCol] === value) {
          return true;
        }
      }
    }
    return false;
  };

  const getCellValidity = (row: number, col: number) => {
    const value = board[row][col];
    if (value === 0) return { isValid: false, isInvalid: false };
    
    const hasDuplicate = hasDuplicateInRow(row, col, value) || 
                        hasDuplicateInCol(row, col, value) || 
                        hasDuplicateInBox(row, col, value);
    
    return {
      isValid: !hasDuplicate,
      isInvalid: hasDuplicate
    };
  };

  if (board.length === 0) return null;

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((value, colIndex) => {
            const { isValid, isInvalid } = getCellValidity(rowIndex, colIndex);
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={value}
                initialValue={initialBoard[rowIndex][colIndex]}
                isValid={isValid}
                isInvalid={isInvalid}
                onChange={(newValue) => handleCellChange(rowIndex, colIndex, newValue)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                memoNumbers={memoNumbers[`${rowIndex}-${colIndex}`] || []}
                onMemoNumberClick={(number) => handleMemoNumberClick(rowIndex, colIndex, number)}
                memoMode={memoMode}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board; 