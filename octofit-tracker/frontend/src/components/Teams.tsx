import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; members?: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load teams'));
  }, []);

  return <main><h2>Teams</h2>{error ? <div role="alert">Unable to load teams: {error}</div>
    : teams === undefined ? <div role="status">Loading teams...</div>
    : teams.length === 0 ? <p>No teams found.</p>
    : <ul>{teams.map((team, index) => <li key={index}>{team.name}{team.members?.length ? ` - ${team.members.length} members` : ''}</li>)}</ul>}</main>;
}
