import React from 'react';
import { User, Shield, Calendar } from 'lucide-react';

const MOCK_PARTICIPANTS = [
  {
    id: '1',
    name: 'David Cohen',
    belt: 'Blue Belt',
    registeredEvents: [
      { id: '1', title: 'Fundamentals Class', date: '2024-03-20' },
      { id: '2', title: 'Summer BJJ Competition', date: '2024-07-15' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Levy',
    belt: 'Purple Belt',
    registeredEvents: [
      { id: '2', title: 'Advanced Training', date: '2024-03-21' },
      { id: '3', title: 'Guard Passing Workshop', date: '2024-04-20' }
    ]
  }
];

function ParticipantsList() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Participants</h2>
        <div className="space-y-6">
          {MOCK_PARTICIPANTS.map((participant) => (
            <div
              key={participant.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-orange-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{participant.name}</h3>
                    <div className="flex items-center mt-1 text-gray-600">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>{participant.belt}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Registered Events:</h4>
                <div className="space-y-2">
                  {participant.registeredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center text-sm text-gray-600 bg-orange-50 rounded-md p-2"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      <span>{event.title}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ParticipantsList;