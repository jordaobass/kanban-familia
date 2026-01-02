'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Profile, ProfileName, PROFILES } from '@/types';

interface ProfileContextType {
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  selectProfile: (name: ProfileName) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'tarefa-familia-profile';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        const profileName = savedProfile as ProfileName;
        const profile = PROFILES.find(p => p.name === profileName);
        if (profile) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Load saved profile on mount
          setCurrentProfile(profile);
        }
      }
    }
  }, []);

  const selectProfile = (name: ProfileName) => {
    const profile = PROFILES.find(p => p.name === name);
    if (profile) {
      setCurrentProfile(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, name);
      }
    }
  };

  const clearProfile = () => {
    setCurrentProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ProfileContext.Provider value={{ currentProfile, setCurrentProfile, selectProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
