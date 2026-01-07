'use client';

import { useState } from 'react';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { LoadingSpinner } from './LoadingSpinner';
import { Avatar } from './ui/Avatar';

interface CompletedByModalProps {
  isOpen: boolean;
  taskTitle: string;
  onSelect: (memberName: string) => Promise<void>;
  onCancel: () => void;
}

export function CompletedByModal({ isOpen, taskTitle, onSelect, onCancel }: CompletedByModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const { members, loading: loadingMembers, getAvatarUrl, getMemberBgColor, getMemberEmoji } = useFamilyMembers();

  if (!isOpen) return null;

  const handleSelect = async (memberName: string) => {
    if (loading) return; // Prevent double clicks

    setLoading(true);
    setSelectedMember(memberName);

    try {
      await onSelect(memberName);
    } catch (error) {
      console.error('Error completing task:', error);
      setLoading(false);
      setSelectedMember(null);
    }
  };

  const selectedMemberData = members.find(m => m.name === selectedMember);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
          {loading ? 'Registrando...' : 'Quem completou?'}
        </h2>
        <p className="text-center text-gray-500 mb-6 truncate">
          {taskTitle}
        </p>

        {loadingMembers ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-2">👨‍👩‍👧‍👦</span>
            <p className="text-gray-600">Nenhum membro cadastrado.</p>
            <p className="text-sm text-gray-500">Cadastre membros em Família.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse flex items-center justify-center overflow-hidden">
                {selectedMemberData && (
                  <Avatar
                    src={getAvatarUrl(selectedMemberData)}
                    alt={selectedMemberData.name}
                    fallback={getMemberEmoji(selectedMemberData)}
                    size="xl"
                  />
                )}
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Salvando ponto para {selectedMember}...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member.name)}
                disabled={loading}
                className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: getMemberBgColor(member) }}
              >
                <Avatar
                  src={getAvatarUrl(member)}
                  alt={member.name}
                  fallback={getMemberEmoji(member)}
                  size="lg"
                />
                <span className="font-bold mt-2" style={{ color: member.color }}>
                  {member.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {!loading && (
          <button
            onClick={onCancel}
            className="w-full mt-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
