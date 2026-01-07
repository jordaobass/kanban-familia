'use client';

import { useState, useEffect } from 'react';
import { FamilyMember } from '@/types';
import { subscribeFamilyMembers } from '@/lib/firestore';

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeFamilyMembers((fetchedMembers) => {
      setMembers(fetchedMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to get a member by name
  const getMemberByName = (name: string): FamilyMember | undefined => {
    return members.find((m) => m.name === name);
  };

  // Helper to get a member by id
  const getMemberById = (id: string): FamilyMember | undefined => {
    return members.find((m) => m.id === id);
  };

  // Get avatar URL for a member (only returns the photo URL if it exists)
  const getAvatarUrl = (member: FamilyMember): string | undefined => {
    return member.photoUrl || undefined;
  };

  // Get emoji for member (uses stored emoji or fallback based on type)
  const getMemberEmoji = (member: FamilyMember): string => {
    if (member.emoji) return member.emoji;
    return member.isChild ? '👧' : '👨';
  };

  // Get background color (lighter version of member color)
  const getMemberBgColor = (member: FamilyMember): string => {
    // Convert hex to lighter version
    const hex = member.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Make it much lighter (closer to white)
    const lightR = Math.round(r + (255 - r) * 0.85);
    const lightG = Math.round(g + (255 - g) * 0.85);
    const lightB = Math.round(b + (255 - b) * 0.85);
    return `rgb(${lightR}, ${lightG}, ${lightB})`;
  };

  return {
    members,
    loading,
    getMemberByName,
    getMemberById,
    getAvatarUrl,
    getMemberEmoji,
    getMemberBgColor,
  };
}
