export interface Training {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  maxParticipants: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Competition' | 'Workshop';
  maxParticipants: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  belt: string;
}