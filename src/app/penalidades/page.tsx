'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PenaltyReason } from '@/types';
import {
  subscribePenaltyReasons,
  initializePenaltyReasons,
  createPenaltyReason,
  updatePenaltyReason,
  deletePenaltyReason,
} from '@/lib/firestore';

export default function PenalidadesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reasons, setReasons] = useState<PenaltyReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReason, setEditingReason] = useState<PenaltyReason | null>(null);
  const [formData, setFormData] = useState({
    emoji: '😤',
    reason: '',
    points: -1,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Initialize default reasons if needed
    initializePenaltyReasons().catch(console.error);

    const unsubscribe = subscribePenaltyReasons((fetchedReasons) => {
      setReasons(fetchedReasons);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (reason?: PenaltyReason) => {
    if (reason) {
      setEditingReason(reason);
      setFormData({
        emoji: reason.emoji,
        reason: reason.reason,
        points: reason.points,
      });
    } else {
      setEditingReason(null);
      setFormData({
        emoji: '😤',
        reason: '',
        points: -1,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReason(null);
    setFormData({
      emoji: '😤',
      reason: '',
      points: -1,
    });
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim()) return;

    try {
      if (editingReason?.id) {
        await updatePenaltyReason(editingReason.id, formData);
      } else {
        await createPenaltyReason(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving penalty reason:', error);
    }
  };

  const handleDelete = async (reasonId: string) => {
    if (confirm('Tem certeza que deseja remover este motivo?')) {
      try {
        await deletePenaltyReason(reasonId);
      } catch (error) {
        console.error('Error deleting penalty reason:', error);
      }
    }
  };

  // Emoji picker - usando alguns emojis comuns para penalidades
  const PENALTY_EMOJIS = [
    '😤', '😠', '😡', '🗣️', '😭', '😢', '😿', '💢',
    '📱', '🎮', '📺', '🍽️', '🛏️', '🧹', '📚', '✏️',
    '🚫', '⛔', '❌', '⚠️', '🔇', '🙅', '👎', '💔',
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                ⚠️ Motivos de Penalidade
              </h1>
              <p className="text-gray-600">Gerencie os motivos e pontos das penalidades</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Novo Motivo
            </button>
          </div>

          {/* Reasons List */}
          {reasons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
              <span className="text-6xl block mb-4">⚠️</span>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                Nenhum motivo cadastrado
              </h2>
              <p className="text-gray-500 mb-6">
                Adicione motivos de penalidade para poder aplicar aos membros.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Adicionar Primeiro Motivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reasons.map((reason) => (
                <div
                  key={reason.id}
                  className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-red-400 hover:shadow-xl transition-all duration-200 flex items-center gap-4"
                >
                  <span className="text-4xl">{reason.emoji}</span>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {reason.reason}
                    </h3>
                  </div>

                  <div className="text-center px-4">
                    <span className="text-2xl font-bold text-red-600">
                      {reason.points}
                    </span>
                    <p className="text-xs text-gray-500">pontos</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(reason)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-xl">✏️</span>
                    </button>
                    <button
                      onClick={() => reason.id && handleDelete(reason.id)}
                      className="p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-colors"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-start gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Dica</h3>
                <p className="text-gray-600 text-sm">
                  Os pontos sao sempre negativos. Uma penalidade de -2 pontos e mais
                  severa que uma de -1 ponto. Os motivos aparecem ordenados do mais
                  severo para o menos severo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingReason ? '✏️ Editar Motivo' : '➕ Novo Motivo'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Emoji Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emoji
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                  {PENALTY_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`
                        w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all
                        ${formData.emoji === emoji
                          ? 'bg-red-500 scale-110 shadow-lg'
                          : 'bg-white hover:bg-gray-100'
                        }
                      `}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ex: Briga com irmao"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pontos a perder
                </label>
                <div className="flex gap-2">
                  {[-1, -2, -3, -4, -5].map((points) => (
                    <button
                      key={points}
                      type="button"
                      onClick={() => setFormData({ ...formData, points })}
                      className={`
                        flex-1 py-3 rounded-xl font-bold transition-all duration-200
                        ${formData.points === points
                          ? 'bg-red-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {points}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{formData.emoji}</span>
                  <span className="flex-1 font-medium text-gray-800">
                    {formData.reason || 'Motivo da penalidade'}
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    {formData.points}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!formData.reason.trim()}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {editingReason ? 'Salvar Alteracoes' : 'Adicionar Motivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
