// src/components/WeeklySchedule.tsx
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
    try {
      // Basic query to get all trainings
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Error fetching trainings:', error);
        return;
      }

      // Format the trainings data
      const formattedTrainings: Training[] = data.map((training) => ({
        id: training.id,
        title: training.title,
        startTime: training.start_time,
        endTime: training.end_time,
        level: training.level,
        maxParticipants: training.max_participants,
        dayOfWeek: training.day_of_week,
        participants: [], // Will be populated separately
      }));

      setTrainings(formattedTrainings);
      
      // Only try to fetch participants if there are trainings
      if (formattedTrainings.length > 0) {
        fetchTrainingParticipants();
      }
    } catch (e) {
      console.error('Exception in fetchTrainings:', e);
    }
  }

  async function fetchTrainingParticipants() {
    try {
      // Get all registrations
      const { data, error } = await supabase
        .from('registrations')
        .select('training_id, user_id');

      if (error) {
        console.error('Error fetching registrations:', error);
        return;
      }

      // Get all users who have registrations
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(reg => reg.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, belt')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }
        
        // Create a map of user profiles
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        
        // Update trainings with participants
        const updatedTrainings = [...trainings];
        data.forEach(reg => {
          const trainingIndex = updatedTrainings.findIndex(t => t.id === reg.training_id);
          const userProfile = profilesMap.get(reg.user_id);
          
          if (trainingIndex !== -1 && userProfile) {
            updatedTrainings[trainingIndex].participants.push({
              id: userProfile.id,
              name: userProfile.name,
              belt: userProfile.belt
            });
          }
        });
        
        setTrainings(updatedTrainings);
      }
    } catch (e) {
      console.error('Exception in fetchTrainingParticipants:', e);
    }
  }

  async function fetchUserRegistrations() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('training_id')
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error fetching user registrations:', error);
        return;
      }

      setRegistrations(new Set(data.map((reg) => reg.training_id)));
    } catch (e) {
      console.error('Exception in fetchUserRegistrations:', e);
    }
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

      // Refresh training data
      fetchTrainings();
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
