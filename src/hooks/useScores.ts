'use client';

import { useState, useEffect } from 'react';
import { Score, PROFILES, getWeekString } from '@/types';
import { subscribeScores } from '@/lib/firestore';

export function useScores(selectedWeek?: string) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(selectedWeek || getWeekString(new Date()));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial loading state before subscription
    setLoading(true);
    const unsubscribe = subscribeScores((fetchedScores) => {
      setScores(fetchedScores);
      setLoading(false);
    }, currentWeek);

    return () => unsubscribe();
  }, [currentWeek]);

  // Get scores sorted by points (descending)
  const sortedScores = PROFILES.map((profile) => {
    const score = scores.find((s) => s.profile === profile.name);
    return {
      profile,
      points: score?.points || 0,
      tasksCompleted: score?.tasksCompleted.length || 0,
    };
  }).sort((a, b) => b.points - a.points);

  return {
    scores: sortedScores,
    loading,
    currentWeek,
    setCurrentWeek,
  };
}
