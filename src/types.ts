export interface LeaderboardEntry {
  id: number;
  nickname: string;
  completion_time: number;
  difficulty: string;
  created_at: string;
}

export interface BoardProps {
  board: number[][];
  initialBoard: number[][];
  onCellClick: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  memoMode: 'select' | 'pencil' | 'eraser';
  onMemoChange: (row: number, col: number, value: number) => void;
  isInvalid: boolean[][];
  memoNumbers: { [key: string]: number[] };
  onMemoNumberClick: (row: number, col: number, number: number) => void;
}

export interface CellProps {
  value: number;
  initialValue: number;
  isSelected: boolean;
  onClick: () => void;
  memoMode: 'select' | 'pencil' | 'eraser';
  onMemoNumberClick: (number: number) => void;
  isInvalid: boolean;
  isValid: boolean;
  memoNumbers: number[];
  onChange: (value: number) => void;
} 