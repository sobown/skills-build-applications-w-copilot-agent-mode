import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load activities'));
  }, []);

  return <main><h2>Activities</h2>{error ? <div role="alert">Unable to load activities: {error}</div>
    : activities === undefined ? <div role="status">Loading activities...</div>
    : activities.length === 0 ? <p>No activities found.</p>
    : <ul>{activities.map((activity, index) => <li key={index}>{activity.type} - {activity.minutes} minutes - {activity.points} points</li>)}</ul>}</main>;
}
