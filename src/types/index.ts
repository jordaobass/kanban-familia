import { Timestamp } from 'firebase/firestore';

export type ProfileName = 'Prin' | 'Jon' | 'Benicio' | 'Louise';

export type TaskCategory = 'adult' | 'child';

export type RecurrenceType = 'none' | 'daily' | 'weekly';

export type TaskStatus = 'todo' | 'done';

export type TimeOfDay = 'morning' | 'afternoon' | 'night';

export interface Profile {
  name: ProfileName;
  emoji: string;
  color: string;
  bgColor: string;
  isChild: boolean;
}

export interface TaskRecurrence {
  type: RecurrenceType;
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
}

export interface Task {
  id: string;
  title: string;
  emoji: string;
  category: TaskCategory;
  assignedTo: ProfileName | null;
  recurrence: TaskRecurrence;
  timeOfDay?: TimeOfDay;
  status: TaskStatus;
  completedBy?: ProfileName;
  completedAt?: Timestamp;
  lastResetAt: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Score {
  id: string;
  profile: ProfileName;
  week: string; // "YYYY-WXX" format (e.g., "2025-W01")
  points: number;
  tasksCompleted: string[];
}

// Helper to get week number of year
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Get week string in YYYY-WXX format
export const getWeekString = (date: Date): string => {
  const week = getWeekNumber(date);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

// Get start and end dates of a week
export const getWeekDates = (weekString: string): { start: Date; end: Date } => {
  const [year, weekPart] = weekString.split('-W');
  const weekNum = parseInt(weekPart, 10);

  // Get first day of year
  const jan1 = new Date(parseInt(year, 10), 0, 1);
  // Get first Thursday of year (week 1 contains first Thursday)
  const firstThursday = new Date(jan1);
  firstThursday.setDate(jan1.getDate() + (4 - (jan1.getDay() || 7)));

  // Calculate start of requested week (Monday)
  const start = new Date(firstThursday);
  start.setDate(firstThursday.getDate() - 3 + (weekNum - 1) * 7);

  // End is Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
};

// Get weeks of current month
export const getWeeksOfMonth = (year: number, month: number): string[] => {
  const weeks: string[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const currentDate = new Date(firstDay);
  while (currentDate <= lastDay) {
    const weekStr = getWeekString(currentDate);
    if (!weeks.includes(weekStr)) {
      weeks.push(weekStr);
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

export interface TaskFormData {
  title: string;
  emoji: string;
  category: TaskCategory;
  assignedTo: ProfileName[];  // Array for multiple selection
  recurrence: TaskRecurrence;
  timeOfDay?: TimeOfDay;
}

export const PROFILES: Profile[] = [
  { name: 'Prin', emoji: '👩', color: '#EC4899', bgColor: '#FDF2F8', isChild: false },
  { name: 'Jon', emoji: '👨', color: '#3B82F6', bgColor: '#EFF6FF', isChild: false },
  { name: 'Benicio', emoji: '🧒', color: '#10B981', bgColor: '#ECFDF5', isChild: true },
  { name: 'Louise', emoji: '👸', color: '#F59E0B', bgColor: '#FFFBEB', isChild: true },
];

export const TASK_EMOJIS = [
  // Higiene pessoal
  '🦷', '🪥', '🚿', '🛁', '🧼', '💇', '💅', '🧴', '🪒', '💆', '🧖',
  // Limpeza da casa
  '🧹', '🧽', '🗑️', '🧺', '👕', '🧦', '🛏️', '🪣', '🧲', '🪟', '🚽',
  // Alimentação e cozinha
  '🍽️', '🍳', '🥗', '🍎', '🥛', '🧃', '🍪', '🥣', '🥪', '🍕', '🍔', '🥤', '☕', '🍰',
  // Estudo e escola
  '📚', '✏️', '📖', '🎒', '📝', '🖍️', '📐', '🔢', '🖊️', '📓', '🎓', '💻', '🔬',
  // Lazer e esportes
  '🎮', '🧸', '⚽', '🏃', '🚴', '🎨', '🎵', '🎭', '🎬', '🏊', '🏀', '🎾', '🎯', '🎲', '🧩',
  // Animais e plantas
  '🐕', '🐈', '🐠', '🌱', '🪴', '💐', '🌻', '🐾', '🐦', '🐢', '🐰', '🌳', '🌺',
  // Casa e organização
  '🏠', '🔑', '📦', '🗂️', '💡', '🔧', '🚗', '🛒', '🛋️', '🪑', '📺', '🧳', '🚪',
  // Saúde e cuidados
  '💤', '⏰', '📱', '💊', '🩹', '👟', '🎁', '❤️', '🩺', '💪', '🧘', '🌡️',
  // Comunicação e tarefas
  '📞', '✉️', '📮', '🗓️', '📋', '✅', '🔔', '💬', '📎', '🖨️',
  // Transporte e viagem
  '🚌', '✈️', '🚂', '🏖️', '🎡', '🗺️',
  // Diversos
  '⭐', '🌈', '🎉', '🏆', '👑', '💎', '🌟', '🔥', '💫', '🎀', '🎈', '🧠'
];

export const TIME_OF_DAY = [
  { value: 'morning' as TimeOfDay, label: 'Manha', emoji: '🌅' },
  { value: 'afternoon' as TimeOfDay, label: 'Tarde', emoji: '☀️' },
  { value: 'night' as TimeOfDay, label: 'Noite', emoji: '🌙' },
];

export const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];
