'use client';

import { useState } from 'react';
import { PROFILES, ProfileName } from '@/types';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  profile?: ProfileName;
  color?: string;
  isGoogleEvent?: boolean;
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function FamilyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    profile: '' as ProfileName | '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty slots for days before the first day
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= totalDays; day++) {
    calendarDays.push(day);
  }

  const navigateMonth = (delta: number) => {
    const newDate = new Date(year, month + delta, 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  const getEventsForDay = (day: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year;
    });
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      date: selectedDate,
      time: newEvent.time || undefined,
      profile: newEvent.profile || undefined,
      color: newEvent.profile
        ? PROFILES.find(p => p.name === newEvent.profile)?.color
        : '#6366F1',
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', time: '', profile: '' });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const selectedDateEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border-2 border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">◀️</span>
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Ir para hoje
            </button>
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">▶️</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS_SHORT.map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 font-bold text-sm ${
                index === 0 ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-24" />;
            }

            const dayEvents = getEventsForDay(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  h-24 p-1 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isTodayDate
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-100 hover:border-purple-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`text-right text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  {day}
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => {
                    const profile = event.profile
                      ? PROFILES.find(p => p.name === event.profile)
                      : null;

                    return (
                      <div
                        key={event.id}
                        className="text-xs truncate rounded px-1 py-0.5"
                        style={{
                          backgroundColor: event.color ? `${event.color}20` : '#6366F120',
                          color: event.color || '#6366F1',
                        }}
                      >
                        {profile && <span>{profile.emoji}</span>} {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Calendar Integration Info */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mt-4 border-2 border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📅</span>
          <div>
            <h3 className="font-bold text-gray-800">Google Calendar</h3>
            <p className="text-sm text-gray-500">
              Para sincronizar com o Google Calendar, configure a API do Google no projeto.
            </p>
          </div>
          <button
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled
          >
            Conectar
          </button>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  📅 {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
                </h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Existing events */}
              {selectedDateEvents.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h3 className="font-medium text-gray-700">Eventos do dia:</h3>
                  {selectedDateEvents.map(event => {
                    const profile = event.profile
                      ? PROFILES.find(p => p.name === event.profile)
                      : null;

                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ backgroundColor: `${event.color}20` }}
                      >
                        <div className="flex items-center gap-2">
                          {profile && <span>{profile.emoji}</span>}
                          <span className="font-medium">{event.title}</span>
                          {event.time && (
                            <span className="text-sm text-gray-500">{event.time}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new event */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Novo evento:</h3>

                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Titulo do evento"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />

                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />

                <select
                  value={newEvent.profile}
                  onChange={(e) => setNewEvent({ ...newEvent, profile: e.target.value as ProfileName | '' })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">Toda a familia</option>
                  {PROFILES.map(profile => (
                    <option key={profile.name} value={profile.name}>
                      {profile.emoji} {profile.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Adicionar Evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
