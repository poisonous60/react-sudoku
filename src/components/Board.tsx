import React from 'react';
import Cell from './Cell.tsx';
import { BoardProps } from '../types.ts';

const Board: React.FC<BoardProps> = ({ 
  board = [], 
  initialBoard = [], 
  onCellClick, 
  selectedCell, 
  memoMode,
  onMemoChange,
  isInvalid = [],
  memoNumbers = {},
  onMemoNumberClick
}) => {
  if (!board || !initialBoard || !board.length || !initialBoard.length) {
    return <div className="board">로딩 중...</div>;
  }

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              initialValue={initialBoard[rowIndex][colIndex]}
              isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
              onClick={() => onCellClick(rowIndex, colIndex)}
              memoMode={memoMode}
              onChange={(value) => onMemoChange(rowIndex, colIndex, value)}
              onMemoNumberClick={(number) => onMemoNumberClick(rowIndex, colIndex, number)}
              isInvalid={isInvalid[rowIndex]?.[colIndex] || false}
              isValid={initialBoard[rowIndex][colIndex] === 0 && board[rowIndex][colIndex] !== 0 && !isInvalid[rowIndex]?.[colIndex]}
              memoNumbers={memoNumbers[`${rowIndex}-${colIndex}`] || []}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board; 