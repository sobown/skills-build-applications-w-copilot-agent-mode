import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: Entry[] }>('/api/leaderboard')
      .then((data) => setEntries(data.leaderboard))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load leaderboard'));
  }, []);

  return <main><h2>Leaderboard</h2>{error ? <div role="alert">Unable to load leaderboard: {error}</div>
    : entries === undefined ? <div role="status">Loading leaderboard...</div>
    : entries.length === 0 ? <p>No leaderboard rankings or scores yet.</p>
    : <ol>{entries.map((entry) => <li key={entry.rank}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol>}</main>;
}
