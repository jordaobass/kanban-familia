import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  increment,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskFormData, Score, ProfileName, TaskStatus, getWeekString, FamilyMember, DailyActivity, PenaltyReason, DEFAULT_PENALTY_REASONS } from '@/types';

const TASKS_COLLECTION = 'tasks';
const SCORES_COLLECTION = 'scores';
const MEMBERS_COLLECTION = 'familyMembers';
const ACTIVITIES_COLLECTION = 'activities';
const PENALTY_REASONS_COLLECTION = 'penaltyReasons';

// Get current week in YYYY-WXX format
const getCurrentWeek = (): string => {
  return getWeekString(new Date());
};

// Tasks Functions
export const subscribeTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, TASKS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    callback(tasks);
  });
};

export const createTask = async (taskData: TaskFormData, createdBy: string): Promise<string[]> => {
  const now = Timestamp.now();
  const createdIds: string[] = [];

  // Create one task for each assigned person
  for (const profile of taskData.assignedTo) {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      title: taskData.title,
      emoji: taskData.emoji,
      category: taskData.category,
      assignedTo: profile,
      recurrence: taskData.recurrence,
      timeOfDay: taskData.timeOfDay || null,
      status: 'todo' as TaskStatus,
      lastResetAt: now,
      createdBy,
      createdAt: now,
    });
    createdIds.push(docRef.id);
  }

  return createdIds;
};

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus,
  completedBy?: ProfileName,
  taskTitle?: string,
  taskEmoji?: string
): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);

  if (status === 'done' && completedBy) {
    await updateDoc(taskRef, {
      status,
      completedBy,
      completedAt: Timestamp.now(),
    });

    // Update score
    await updateScore(completedBy, taskId);

    // Record activity for timeline
    if (taskTitle && taskEmoji) {
      await recordActivity(completedBy, taskId, taskTitle, taskEmoji);
    }
  } else {
    await updateDoc(taskRef, {
      status,
      completedBy: null,
      completedAt: null,
    });
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
};

export const updateTask = async (
  taskId: string,
  data: {
    title: string;
    emoji: string;
    category: 'adult' | 'child';
    recurrence: {
      type: 'none' | 'daily' | 'weekly';
      dayOfWeek?: number;
    };
    timeOfDay?: 'morning' | 'afternoon' | 'night' | null;
  }
): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    title: data.title,
    emoji: data.emoji,
    category: data.category,
    recurrence: data.recurrence,
    timeOfDay: data.timeOfDay || null,
  });
};

export const resetDailyTasks = async (): Promise<void> => {
  const now = new Date();
  const today = now.getDay(); // 0-6 (Sunday = 0)

  const q = query(collection(db, TASKS_COLLECTION), where('status', '==', 'done'));
  const snapshot = await getDocs(q);

  const batch: Promise<void>[] = [];

  snapshot.forEach((docSnapshot) => {
    const task = docSnapshot.data() as Task;
    const lastReset = task.lastResetAt.toDate();
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    let shouldReset = false;

    if (task.recurrence.type === 'daily' && hoursSinceReset >= 24) {
      shouldReset = true;
    } else if (task.recurrence.type === 'weekly') {
      if (task.recurrence.dayOfWeek === today && hoursSinceReset >= 24) {
        shouldReset = true;
      }
    }

    if (shouldReset) {
      batch.push(
        updateDoc(doc(db, TASKS_COLLECTION, docSnapshot.id), {
          status: 'todo',
          completedBy: null,
          completedAt: null,
          lastResetAt: Timestamp.now(),
        })
      );
    }
  });

  await Promise.all(batch);
};

// Scores Functions
export const subscribeScores = (callback: (scores: Score[]) => void, weekStr?: string) => {
  const week = weekStr || getCurrentWeek();
  const q = query(collection(db, SCORES_COLLECTION), where('week', '==', week));

  return onSnapshot(q, (snapshot) => {
    const scores: Score[] = [];
    snapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() } as Score);
    });
    callback(scores);
  });
};

export const updateScore = async (profile: ProfileName, taskId: string): Promise<void> => {
  const week = getCurrentWeek();
  const scoreId = `${profile}_${week}`;
  const scoreRef = doc(db, SCORES_COLLECTION, scoreId);

  const scoreDoc = await getDoc(scoreRef);

  if (scoreDoc.exists()) {
    const data = scoreDoc.data() as Score;
    if (!data.tasksCompleted.includes(taskId)) {
      await updateDoc(scoreRef, {
        points: increment(1),
        tasksCompleted: [...data.tasksCompleted, taskId],
      });
    }
  } else {
    await setDoc(scoreRef, {
      profile,
      week,
      points: 1,
      tasksCompleted: [taskId],
    });
  }
};

export const getAllScores = async (): Promise<Score[]> => {
  const snapshot = await getDocs(collection(db, SCORES_COLLECTION));
  const scores: Score[] = [];
  snapshot.forEach((doc) => {
    scores.push({ id: doc.id, ...doc.data() } as Score);
  });
  return scores;
};

// Family Members Functions
export const subscribeFamilyMembers = (callback: (members: FamilyMember[]) => void) => {
  const q = query(collection(db, MEMBERS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const members: FamilyMember[] = [];
    snapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() } as FamilyMember);
    });
    callback(members);
  });
};

export const createFamilyMember = async (data: {
  name: string;
  photoUrl?: string;
  isChild: boolean;
  color: string;
}): Promise<string> => {
  const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateFamilyMember = async (
  memberId: string,
  data: {
    name?: string;
    photoUrl?: string;
    isChild?: boolean;
    color?: string;
  }
): Promise<void> => {
  const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
  await updateDoc(memberRef, data);
};

export const deleteFamilyMember = async (memberId: string): Promise<void> => {
  await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));
};

// Activities Functions (for timeline)
export const recordActivity = async (
  profile: ProfileName,
  taskId: string,
  taskTitle: string,
  taskEmoji: string
): Promise<void> => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  await addDoc(collection(db, ACTIVITIES_COLLECTION), {
    profile,
    type: 'task',
    date: dateStr,
    taskId,
    taskTitle,
    taskEmoji,
    points: 1,
    completedAt: Timestamp.now(),
  });
};

// Record a penalty
export const recordPenalty = async (
  profile: ProfileName,
  reason: string,
  emoji: string,
  points: number
): Promise<void> => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const week = getWeekString(now);

  // Record in activities for timeline
  await addDoc(collection(db, ACTIVITIES_COLLECTION), {
    profile,
    type: 'penalty',
    date: dateStr,
    taskTitle: reason,
    taskEmoji: emoji,
    points: points, // Negative value
    penaltyReason: reason,
    completedAt: Timestamp.now(),
  });

  // Update score (subtract points)
  const scoreId = `${profile}_${week}`;
  const scoreRef = doc(db, SCORES_COLLECTION, scoreId);

  const scoreDoc = await getDoc(scoreRef);

  if (scoreDoc.exists()) {
    await updateDoc(scoreRef, {
      points: increment(points), // points is negative
    });
  } else {
    await setDoc(scoreRef, {
      profile,
      week,
      points: points, // Negative starting value
      tasksCompleted: [],
    });
  }
};

export const subscribeActivities = (
  profile: ProfileName,
  startDate: string,
  endDate: string,
  callback: (activities: (DailyActivity & { profile: ProfileName })[]) => void
) => {
  const q = query(
    collection(db, ACTIVITIES_COLLECTION),
    where('profile', '==', profile),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  return onSnapshot(q, (snapshot) => {
    const activities: (DailyActivity & { profile: ProfileName })[] = [];
    snapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as DailyActivity & { profile: ProfileName; id: string });
    });
    // Sort by completedAt descending
    activities.sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis());
    callback(activities);
  });
};

export const getActivitiesForDay = async (
  profile: ProfileName,
  date: string
): Promise<DailyActivity[]> => {
  const q = query(
    collection(db, ACTIVITIES_COLLECTION),
    where('profile', '==', profile),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  const activities: DailyActivity[] = [];
  snapshot.forEach((doc) => {
    activities.push({ ...doc.data() } as DailyActivity);
  });
  return activities;
};

// Penalty Reasons Functions
export const subscribePenaltyReasons = (callback: (reasons: PenaltyReason[]) => void) => {
  const q = query(collection(db, PENALTY_REASONS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const reasons: PenaltyReason[] = [];
    snapshot.forEach((doc) => {
      reasons.push({ id: doc.id, ...doc.data() } as PenaltyReason);
    });
    // Sort by points (most severe first)
    reasons.sort((a, b) => a.points - b.points);
    callback(reasons);
  });
};

export const initializePenaltyReasons = async (): Promise<void> => {
  const snapshot = await getDocs(collection(db, PENALTY_REASONS_COLLECTION));

  // Only seed if collection is empty
  if (snapshot.empty) {
    const batch: Promise<unknown>[] = [];
    for (const reason of DEFAULT_PENALTY_REASONS) {
      batch.push(addDoc(collection(db, PENALTY_REASONS_COLLECTION), reason));
    }
    await Promise.all(batch);
  }
};

export const createPenaltyReason = async (data: {
  emoji: string;
  reason: string;
  points: number;
}): Promise<string> => {
  const docRef = await addDoc(collection(db, PENALTY_REASONS_COLLECTION), {
    emoji: data.emoji,
    reason: data.reason,
    points: data.points < 0 ? data.points : -data.points, // Ensure negative
  });
  return docRef.id;
};

export const updatePenaltyReason = async (
  reasonId: string,
  data: {
    emoji?: string;
    reason?: string;
    points?: number;
  }
): Promise<void> => {
  const reasonRef = doc(db, PENALTY_REASONS_COLLECTION, reasonId);
  const updateData: Record<string, unknown> = {};

  if (data.emoji !== undefined) updateData.emoji = data.emoji;
  if (data.reason !== undefined) updateData.reason = data.reason;
  if (data.points !== undefined) {
    updateData.points = data.points < 0 ? data.points : -data.points;
  }

  await updateDoc(reasonRef, updateData);
};

export const deletePenaltyReason = async (reasonId: string): Promise<void> => {
  await deleteDoc(doc(db, PENALTY_REASONS_COLLECTION, reasonId));
};
