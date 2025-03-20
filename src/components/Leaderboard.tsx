import React, { useEffect, useState } from 'react';
import { supabase, LeaderboardEntry } from '../utils/supabase.ts';

type Difficulty = 'Very Easy' | 'Easy' | 'Normal' | 'Hard';

interface LeaderboardProps {
  onClose: () => void;
  initialDifficulty?: Difficulty;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, initialDifficulty = 'Normal' }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDifficulty]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('difficulty', selectedDifficulty)
        .order('completion_time', { ascending: true })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="leaderboard">
        <div className="leaderboard-header">
          <h2>리더보드</h2>
          <div className="difficulty-selector">
            <button 
              className={selectedDifficulty === 'Very Easy' ? 'active' : ''} 
              onClick={() => setSelectedDifficulty('Very Easy')}
            >
              Very Easy
            </button>
            <button 
              className={selectedDifficulty === 'Easy' ? 'active' : ''} 
              onClick={() => setSelectedDifficulty('Easy')}
            >
              Easy
            </button>
            <button 
              className={selectedDifficulty === 'Normal' ? 'active' : ''} 
              onClick={() => setSelectedDifficulty('Normal')}
            >
              Normal
            </button>
            <button 
              className={selectedDifficulty === 'Hard' ? 'active' : ''} 
              onClick={() => setSelectedDifficulty('Hard')}
            >
              Hard
            </button>
          </div>
        </div>
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>순위</th>
                <th>닉네임</th>
                <th>완료 시간</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>{entry.nickname}</td>
                  <td>{entry.completion_time}초</td>
                  <td>{new Date(entry.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default Leaderboard; 