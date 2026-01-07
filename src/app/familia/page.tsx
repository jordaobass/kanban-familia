'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Avatar, PLACEHOLDER_AVATARS } from '@/components/ui/Avatar';
import { FamilyMember, ProfileName, PERSON_EMOJIS } from '@/types';
import {
  subscribeFamilyMembers,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from '@/lib/firestore';

const COLORS = [
  { value: '#EC4899', name: 'Rosa' },
  { value: '#3B82F6', name: 'Azul' },
  { value: '#10B981', name: 'Verde' },
  { value: '#F59E0B', name: 'Amarelo' },
  { value: '#8B5CF6', name: 'Roxo' },
  { value: '#EF4444', name: 'Vermelho' },
  { value: '#06B6D4', name: 'Ciano' },
  { value: '#F97316', name: 'Laranja' },
];

export default function FamiliaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '👨',
    photoUrl: '',
    isChild: false,
    color: '#EC4899',
    birthDate: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const unsubscribe = subscribeFamilyMembers((fetchedMembers) => {
      setMembers(fetchedMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        emoji: member.emoji || '👨',
        photoUrl: member.photoUrl || '',
        isChild: member.isChild,
        color: member.color,
        birthDate: member.birthDate || '',
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        emoji: '👨',
        photoUrl: '',
        isChild: false,
        color: '#EC4899',
        birthDate: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      emoji: '👨',
      photoUrl: '',
      isChild: false,
      color: '#EC4899',
      birthDate: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingMember) {
        await updateFamilyMember(editingMember.id, formData);
      } else {
        await createFamilyMember(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      try {
        await deleteFamilyMember(memberId);
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const getPlaceholderPhoto = (name: string) => {
    const key = name as ProfileName;
    return PLACEHOLDER_AVATARS[key] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
  };

  // Check if today is someone's birthday
  const isBirthday = (birthDate?: string): boolean => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
  };

  // Format birth date for display
  const formatBirthDate = (birthDate?: string): string => {
    if (!birthDate) return '';
    const date = new Date(birthDate + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

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
                Membros da Familia
              </h1>
              <p className="text-gray-600">Gerencie os membros da sua familia</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Novo Membro
            </button>
          </div>

          {/* Members Grid */}
          {members.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
              <span className="text-6xl block mb-4">👨‍👩‍👧‍👦</span>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                Nenhum membro cadastrado
              </h2>
              <p className="text-gray-500 mb-6">
                Adicione os membros da sua familia para comecar!
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
              >
                Adicionar Primeiro Membro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`
                    bg-white rounded-2xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-all duration-200
                    ${isBirthday(member.birthDate) ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                  `}
                  style={{ borderLeftColor: member.color }}
                >
                  {isBirthday(member.birthDate) && (
                    <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-gradient-to-r from-yellow-100 to-pink-100 rounded-xl">
                      <span className="text-2xl">🎂</span>
                      <span className="font-bold text-pink-600">Feliz Aniversário!</span>
                      <span className="text-2xl">🎉</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar
                        src={member.photoUrl}
                        alt={member.name}
                        fallback={member.emoji || '👤'}
                        size="lg"
                      />
                      {isBirthday(member.birthDate) && (
                        <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎈</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">{member.emoji || '👤'}</span>
                        {member.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span
                          className={`
                            inline-block px-3 py-1 rounded-full text-sm font-medium
                            ${member.isChild
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                            }
                          `}
                        >
                          {member.isChild ? 'Crianca' : 'Adulto'}
                        </span>
                        {member.birthDate && (
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-700">
                            🎂 {formatBirthDate(member.birthDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        <span className="text-xl">🗑️</span>
                      </button>
                    </div>
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
                  Voce pode adicionar fotos dos membros da familia! Basta colocar
                  a URL da imagem no campo &quot;URL da Foto&quot; ao criar ou editar um membro.
                  Se nao tiver uma foto, usaremos um avatar automatico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingMember ? '✏️ Editar Membro' : '➕ Novo Membro'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="flex justify-center mb-4">
                <Avatar
                  src={formData.photoUrl || undefined}
                  alt={formData.name}
                  fallback={formData.emoji || '👤'}
                  size="xl"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do membro"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emoji
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                  {PERSON_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji: e })}
                      className={`
                        text-2xl p-2 rounded-xl transition-all duration-200
                        ${formData.emoji === e ? 'bg-purple-200 scale-110 shadow-lg' : 'hover:bg-gray-200'}
                      `}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Foto (opcional)
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isChild: false })}
                    className={`
                      flex-1 py-3 rounded-xl font-medium transition-all duration-200
                      ${!formData.isChild
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    👨 Adulto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isChild: true })}
                    className={`
                      flex-1 py-3 rounded-xl font-medium transition-all duration-200
                      ${formData.isChild
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    👧 Crianca
                  </button>
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento (opcional)
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`
                        h-12 rounded-xl transition-all duration-200
                        ${formData.color === color.value
                          ? 'ring-4 ring-offset-2 ring-gray-400 scale-105'
                          : 'hover:scale-105'
                        }
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {editingMember ? 'Salvar Alteracoes' : 'Adicionar Membro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
