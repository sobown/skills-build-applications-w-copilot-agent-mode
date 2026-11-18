import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ suggestions: Suggestion[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load workout suggestions'));
  }, []);

  return <main><h2>Workout suggestions</h2>{error ? <div role="alert">Unable to load workout suggestions: {error}</div>
    : suggestions === undefined ? <div role="status">Loading workout suggestions...</div>
    : suggestions.length === 0 ? <p>No workout suggestions found.</p>
    : <ul>{suggestions.map((suggestion, index) => <li key={index}><strong>{suggestion.title}</strong>: {suggestion.reason}</li>)}</ul>}</main>;
}
