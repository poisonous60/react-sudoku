export const isValidNumber = (board: number[][], row: number, col: number, num: number): boolean => {
  // 가로 체크
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // 세로 체크
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // 3x3 박스 체크
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
};

export const generateSudoku = (initialNumbers: number = 35): { board: number[][], initialBoard: number[][] } => {
  const board = Array(9).fill(0).map(() => Array(9).fill(0));
  const initialBoard = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // 첫 번째 행에 1-9를 랜덤하게 배치
  const firstRow = Array.from({ length: 9 }, (_, i) => i + 1);
  for (let i = 0; i < 9; i++) {
    const randomIndex = Math.floor(Math.random() * firstRow.length);
    board[0][i] = firstRow[randomIndex];
    firstRow.splice(randomIndex, 1);
  }

  // 나머지 칸 채우기
  const solveSudoku = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidNumber(board, row, col, num)) {
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

  // 일부 숫자를 제거하여 퍼즐 생성
  const cellsToRemove = 81 - initialNumbers;
  for (let i = 0; i < cellsToRemove; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
    } else {
      i--;
    }
  }

  // 초기 보드 복사
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      initialBoard[i][j] = board[i][j];
    }
  }

  return { board, initialBoard };
};

export const isBoardComplete = (board: number[][]): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) return false;
      if (!isValidNumber(board, i, j, board[i][j])) return false;
    }
  }
  return true;
}; 