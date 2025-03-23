// WeeklySchedule.tsx - simplified version
import React, { useState, useEffect } from 'react';
import { Clock, Users, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function WeeklySchedule() {
  const [trainings, setTrainings] = useState([]);
  const [registrations, setRegistrations] = useState(new Set());
  const { user, profile } = useAuthStore();

  useEffect(() => {
    fetchTrainings();
    if (user && profile) {
      fetchUserRegistrations();
    }
  }, [user, profile]);

  async function fetchTrainings() {
    try {
      console.log('Fetching trainings...');
      const { data, error } = await supabase
        .from('trainings')
        .select('*');

      console.log('Trainings result:', { data, error });

      if (error) {
        console.error('Error fetching trainings:', error);
        return;
      }

      // Format trainings without participants for now
      const formattedTrainings = data.map(training => ({
        id: training.id,
        title: training.title || 'Untitled',
        startTime: training.start_time || '00:00',
        endTime: training.end_time || '00:00',
        level: training.level || 'All Levels',
        maxParticipants: training.max_participants || 10,
        dayOfWeek: training.day_of_week || 0,
        participants: [] // Empty for now
      }));

      setTrainings(formattedTrainings);
    } catch (e) {
      console.error('Exception in fetchTrainings:', e);
    }
  }

  async function fetchUserRegistrations() {
    try {
      console.log('Fetching user registrations...');
      const { data, error } = await supabase
        .from('registrations')
        .select('training_id')
        .eq('user_id', profile.id); // Using profile.id (bigint)

      console.log('User registrations result:', { data, error });

      if (error) {
        console.error('Error fetching user registrations:', error);
        return;
      }

      setRegistrations(new Set(data.map(reg => reg.training_id)));
    } catch (e) {
      console.error('Exception in fetchUserRegistrations:', e);
    }
  }

  // Rest of your component...
}
