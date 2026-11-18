import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Invalid activity');
  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (!isObjectId(userId) || !isObjectId(teamId)) throw httpError(400, 'Invalid user or team ID');
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) throw httpError(400, 'Minutes must be positive');
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw httpError(404, 'User or team not found');
  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Invalid team');
  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'Team mascot is required');
  if (members !== undefined && (!Array.isArray(members) || members.some((member) => !isObjectId(member)))) {
    throw httpError(400, 'Team members must be user IDs');
  }
  const memberIds = Array.isArray(members) ? members : [];
  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
  return team.toObject();
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([Team.find().lean(), Activity.find().lean()]);
  const totals = new Map<string, number>();
  for (const activity of activities) {
    const teamId = activity.team.toString();
    totals.set(teamId, (totals.get(teamId) ?? 0) + activity.points);
  }
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totals.get(team._id.toString()) ?? 0 }))
    .filter((entry) => entry.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw httpError(404, 'User not found');
  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const goal = recentActivity?.type === 'run' ? 'endurance'
    : recentActivity?.type === 'strength' ? 'strength'
    : user.fitnessGoal;
  const workouts = await Workout.find().lean();
  const focused = workouts.find((workout) => workout.focus === goal);
  const ordered = focused ? [focused, ...workouts.filter((workout) => workout._id.toString() !== focused._id.toString())] : workouts;
  return ordered.map((workout) => ({
    ...workout,
    reason: recentActivity
      ? `Matches recent ${recentActivity.type} activity and ${goal} goal`
      : `Matches your ${goal} fitness goal`,
  }));
}

export { User };
