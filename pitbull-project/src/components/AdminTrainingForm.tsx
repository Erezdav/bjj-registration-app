// src/components/AdminTrainingForm.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

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

interface AdminTrainingFormProps {
  training: Training | null;
  onSave: (training: Omit<Training, 'id'>) => void;
  onCancel: () => void;
}

function AdminTrainingForm({ training, onSave, onCancel }: AdminTrainingFormProps) {
  const [title, setTitle] = useState(training?.title || '');
  const [description, setDescription] = useState(training?.description || '');
  const [startTime, setStartTime] = useState(training?.startTime || '08:00');
  const [endTime, setEndTime] = useState(training?.endTime || '09:00');
  const [dayOfWeek, setDayOfWeek] = useState(training?.dayOfWeek || 0);
  const [maxParticipants, setMaxParticipants] = useState(training?.maxParticipants || 20);
  const [level, setLevel] = useState(training?.level || 'All Levels');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    } else if (startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (maxParticipants <= 0) {
      newErrors.maxParticipants = 'Max participants must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      title,
      description,
      startTime,
      endTime,
      dayOfWeek,
      maxParticipants,
      level,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {training ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 block w-full p-2 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              placeholder="e.g., Fundamentals Class"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Brief description of the class"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                {DAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`mt-1 block w-full p-2 border ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`mt-1 block w-full p-2 border ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Participants
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              min="1"
              className={`mt-1 block w-full p-2 border ${
                errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxParticipants}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              {training ? 'Update Class' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminTrainingForm;
