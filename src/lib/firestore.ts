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
import { Task, TaskFormData, Score, ProfileName, TaskStatus, getWeekString } from '@/types';

const TASKS_COLLECTION = 'tasks';
const SCORES_COLLECTION = 'scores';

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
  completedBy?: ProfileName
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
