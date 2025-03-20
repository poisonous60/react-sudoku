import React from 'react';
import Cell from './Cell';
import { BoardProps } from '../types';

const Board: React.FC<BoardProps> = ({ 
  board, 
  initialBoard, 
  onCellClick, 
  selectedCell, 
  memoMode,
  onMemoChange,
  isInvalid 
}) => {
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
              onMemoChange={(memo) => onMemoChange(rowIndex, colIndex, memo)}
              isInvalid={isInvalid[rowIndex][colIndex]}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board; 