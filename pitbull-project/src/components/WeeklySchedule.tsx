import React, { useState, useEffect } from 'react';
import { Clock, Users, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Training {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  level: string;
  maxParticipants: number;
  dayOfWeek: number;
  participants: Array<{
    id: string;
    name: string;
    belt: string;
  }>;
}

function ParticipantsList({ participants }: { participants: Training['participants'] }) {
  return (
    <div className="mt-4 space-y-2">
      {participants.map((participant) => (
        <div key={participant.id} className="flex items-center justify-between bg-orange-50 p-2 rounded-md">
          <span className="text-gray-900">{participant.name}</span>
          <div className="flex items-center text-gray-600">
            <Shield className="w-4 h-4 mr-1" />
            <span>{participant.belt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WeeklySchedule() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const { user, profile } = useAuthStore();

  useEffect(() => {
    fetchTrainings();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  async function fetchTrainings() {
    const { data, error } = await supabase
      .from('trainings')
      .select(`
        *,
        registrations (
          user_id,
          profiles (
            name,
            belt
          )
        )
      `);

    if (error) {
      console.error('Error fetching trainings:', error);
      return;
    }

    const formattedTrainings: Training[] = data.map((training) => ({
      id: training.id,
      title: training.title,
      startTime: training.start_time,
      endTime: training.end_time,
      level: training.level,
      maxParticipants: training.max_participants,
      dayOfWeek: training.day_of_week,
      participants: training.registrations.map((reg: any) => ({
        id: reg.user_id,
        name: reg.profiles.name,
        belt: reg.profiles.belt,
      })),
    }));

    setTrainings(formattedTrainings);
  }

  async function fetchUserRegistrations() {
    const { data, error } = await supabase
      .from('registrations')
      .select('training_id')
      .eq('user_id', user!.id);

    if (error) {
      console.error('Error fetching user registrations:', error);
      return;
    }

    setRegistrations(new Set(data.map((reg) => reg.training_id)));
  }

  async function handleRegistration(trainingId: string) {
    if (!user || !profile) {
      alert('Please sign in to register for classes');
      return;
    }

    const isRegistered = registrations.has(trainingId);

    try {
      if (isRegistered) {
        await supabase
          .from('registrations')
          .delete()
          .eq('training_id', trainingId)
          .eq('user_id', user.id);

        setRegistrations((prev) => {
          const next = new Set(prev);
          next.delete(trainingId);
          return next;
        });
      } else {
        await supabase
          .from('registrations')
          .insert([
            {
              training_id: trainingId,
              user_id: user.id,
            },
          ]);

        setRegistrations((prev) => {
          const next = new Set(prev);
          next.add(trainingId);
          return next;
        });
      }

      await fetchTrainings();
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('Failed to update registration');
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map((day, index) => (
            <div key={day} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {day}
              </h3>
              <div className="space-y-4">
                {trainings
                  .filter((class_) => class_.dayOfWeek === index)
                  .map((class_) => (
                    <div
                      key={class_.id}
                      className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {class_.title}
                          </h4>
                          <div className="flex items-center mt-2 text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>
                              {class_.startTime} - {class_.endTime}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{class_.participants.length} / {class_.maxParticipants} spots</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {class_.level}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <button 
                          onClick={() => setSelectedClass(selectedClass === class_.id ? null : class_.id)}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          {selectedClass === class_.id ? 'Hide Participants' : 'Show Participants'}
                        </button>
                        {user && (
                          <button
                            onClick={() => handleRegistration(class_.id)}
                            className={`py-2 px-4 rounded-md transition-colors ${
                              registrations.has(class_.id)
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                            disabled={!registrations.has(class_.id) && class_.participants.length >= class_.maxParticipants}
                          >
                            {registrations.has(class_.id) ? 'Cancel' : 'Register'}
                          </button>
                        )}
                      </div>

                      {selectedClass === class_.id && (
                        <ParticipantsList participants={class_.participants} />
                      )}
                    </div>
                  ))}
                {trainings.filter((class_) => class_.dayOfWeek === index).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No classes scheduled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklySchedule;