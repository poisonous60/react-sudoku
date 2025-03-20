import React from 'react';

interface CellProps {
  value: number;
  initialValue: number;
  isInvalid: boolean;
  isValid: boolean;
  onChange: (value: number) => void;
  onClick: () => void;
  isSelected: boolean;
  memoNumbers: number[];
  onMemoNumberClick: (number: number) => void;
  memoMode: 'select' | 'pencil' | 'eraser';
}

const Cell: React.FC<CellProps> = ({
  value,
  initialValue,
  isInvalid,
  isValid,
  onChange,
  onClick,
  isSelected,
  memoNumbers,
  onMemoNumberClick,
  memoMode
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (memoMode === 'eraser' && memoNumbers.length > 0) {
      const numbersToErase = [...memoNumbers];
      numbersToErase.forEach(num => onMemoNumberClick(num));
    } else if (memoMode === 'select') {
      onClick();
    }
  };

  return (
    <div 
      className={`cell ${isSelected ? 'selected' : ''} ${isInvalid ? 'invalid' : isValid ? 'valid' : ''}`}
      onClick={handleClick}
    >
      {initialValue !== 0 ? (
        <div className="initial-value">{initialValue}</div>
      ) : (
        <>
          {memoMode === 'select' ? (
            <input
              type="number"
              min="1"
              max="9"
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              className=""
            />
          ) : (
            <>
              <div className="value-display">{value || ''}</div>
              <div className={`memo-numbers ${memoMode === 'pencil' ? 'pencil-mode' : ''} ${memoMode === 'eraser' ? 'eraser-mode' : ''}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div
                    key={num}
                    className={`memo-number ${memoNumbers.includes(num) ? 'active' : ''} ${memoMode === 'pencil' ? 'hoverable' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (memoMode === 'pencil') {
                        onMemoNumberClick(num);
                      } else if (memoMode === 'eraser' && memoNumbers.length > 0) {
                        onMemoNumberClick(memoNumbers[0]);
                      }
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Cell; 