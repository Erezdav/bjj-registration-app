// src/components/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AdminTrainingForm from './AdminTrainingForm';
import { PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Training {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  maxParticipants: number;
  level: string;
}

function AdminPanel() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { profile } = useAuthStore();

  // Check if user is admin
  const isAdmin = profile?.isAdmin === true;

  useEffect(() => {
    if (isAdmin) {
      fetchTrainings();
    }
  }, [isAdmin]);

  async function fetchTrainings() {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;

      const formattedTrainings: Training[] = data.map((training) => ({
        id: training.id,
        title: training.title,
        description: training.description || '',
        startTime: training.start_time,
        endTime: training.end_time,
        dayOfWeek: training.day_of_week,
        maxParticipants: training.max_participants,
        level: training.level,
      }));

      setTrainings(formattedTrainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setError('Failed to load trainings');
    }
  }

  const handleAddTraining = () => {
    setEditingTraining(null);
    setIsModalOpen(true);
  };

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (trainingId: string) => {
    setConfirmDelete(trainingId);
  };

  const handleDeleteTraining = async (trainingId: string) => {
    try {
      // First delete registrations associated with this training
      await supabase
        .from('registrations')
        .delete()
        .eq('training_id', trainingId);

      // Then delete the training
      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', trainingId);

      if (error) throw error;

      setTrainings(trainings.filter((training) => training.id !== trainingId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting training:', error);
      setError('Failed to delete training');
    }
  };

  const handleSaveTraining = async (training: Omit<Training, 'id'>) => {
    try {
      if (editingTraining) {
        // Update existing training
        const { error } = await supabase
          .from('trainings')
          .update({
            title: training.title,
            description: training.description,
            start_time: training.startTime,
            end_time: training.endTime,
            day_of_week: training.dayOfWeek,
            max_participants: training.maxParticipants,
            level: training.level,
          })
          .eq('id', editingTraining.id);

        if (error) throw error;
      } else {
        // Create new training
        const { error } = await supabase.from('trainings').insert([
          {
            title: training.title,
            description: training.description,
            start_time: training.startTime,
            end_time: training.endTime,
            day_of_week: training.dayOfWeek,
            max_participants: training.maxParticipants,
            level: training.level,
          },
        ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchTrainings();
    } catch (error) {
      console.error('Error saving training:', error);
      setError('Failed to save training');
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-gray-600">
            You need admin privileges to access this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <button
            onClick={handleAddTraining}
            className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Class
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainings.map((training) => (
                <tr key={training.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {DAYS[training.dayOfWeek]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {training.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {training.startTime} - {training.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {training.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {training.maxParticipants} spots
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditTraining(training)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {confirmDelete === training.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteTraining(training.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteConfirm(training.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {trainings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No classes have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AdminTrainingForm
          training={editingTraining}
          onSave={handleSaveTraining}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminPanel;
