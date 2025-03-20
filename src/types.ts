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
  onMemoChange: (row: number, col: number, memo: number[]) => void;
  isInvalid: boolean[][];
}

export interface CellProps {
  value: number;
  initialValue: number;
  isSelected: boolean;
  onClick: () => void;
  memoMode: 'select' | 'pencil' | 'eraser';
  onMemoChange: (memo: number[]) => void;
  isInvalid: boolean;
} 