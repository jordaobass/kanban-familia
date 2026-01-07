'use client';

import { useState, useEffect } from 'react';
import { PROFILES, ProfileName, PenaltyReason } from '@/types';
import { recordPenalty, subscribePenaltyReasons, initializePenaltyReasons } from '@/lib/firestore';
import { LoadingSpinner } from './LoadingSpinner';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PenaltyModal({ isOpen, onClose }: PenaltyModalProps) {
  const [step, setStep] = useState<'profile' | 'reason'>('profile');
  const [selectedProfile, setSelectedProfile] = useState<ProfileName | null>(null);
  const [loading, setLoading] = useState(false);
  const [penaltyReasons, setPenaltyReasons] = useState<PenaltyReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize default reasons if needed
    initializePenaltyReasons().catch(console.error);

    const unsubscribe = subscribePenaltyReasons((reasons) => {
      setPenaltyReasons(reasons);
      setLoadingReasons(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (profile: ProfileName) => {
    setSelectedProfile(profile);
    setStep('reason');
  };

  const handleSelectReason = async (reason: { emoji: string; reason: string; points: number }) => {
    if (!selectedProfile || loading) return;

    setLoading(true);

    try {
      await recordPenalty(selectedProfile, reason.reason, reason.emoji, reason.points);
      handleClose();
    } catch (error) {
      console.error('Error recording penalty:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('profile');
    setSelectedProfile(null);
    setLoading(false);
    onClose();
  };

  const handleBack = () => {
    setStep('profile');
    setSelectedProfile(null);
  };

  const profile = selectedProfile ? PROFILES.find((p) => p.name === selectedProfile) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'reason' && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xl">←</span>
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                {step === 'profile' ? 'Dar Penalidade' : 'Escolha o Motivo'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {step === 'reason' && profile && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-red-50">
              <span className="text-3xl">{profile.emoji}</span>
              <div>
                <p className="font-bold text-gray-800">{profile.name}</p>
                <p className="text-sm text-red-600">Vai perder pontos</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse flex items-center justify-center">
                  <span className="text-4xl">😢</span>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-red-300 border-t-red-600 animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                Registrando penalidade...
              </p>
            </div>
          ) : step === 'profile' ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-center mb-4">
                Quem vai receber a penalidade?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PROFILES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectProfile(p.name)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-transparent hover:border-red-300"
                    style={{ backgroundColor: p.bgColor }}
                  >
                    <span className="text-5xl mb-2">{p.emoji}</span>
                    <span className="font-bold" style={{ color: p.color }}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : loadingReasons ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : penaltyReasons.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">⚠️</span>
              <p className="text-gray-600">Nenhum motivo de penalidade cadastrado.</p>
              <p className="text-sm text-gray-500 mt-2">
                Acesse o menu Penalidades para cadastrar.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {penaltyReasons.map((penaltyReason) => (
                <button
                  key={penaltyReason.id || penaltyReason.reason}
                  onClick={() => handleSelectReason(penaltyReason)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100 hover:border-red-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-3xl">{penaltyReason.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{penaltyReason.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-red-600">
                      {penaltyReason.points}
                    </span>
                    <p className="text-xs text-gray-500">pontos</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
