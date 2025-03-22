import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Users, Shield } from 'lucide-react';

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Summer BJJ Competition',
    type: 'Competition',
    date: '2024-07-15',
    price: 50,
    maxParticipants: 100,
    description: 'Annual summer BJJ competition for all belt levels.',
    participants: [
      { id: '1', name: 'David Cohen', belt: 'Blue Belt' },
      { id: '2', name: 'Sarah Levy', belt: 'Purple Belt' },
      { id: '3', name: 'Yossi Levi', belt: 'Brown Belt' }
    ]
  },
  {
    id: '2',
    title: 'Guard Passing Workshop',
    type: 'Workshop',
    date: '2024-04-20',
    price: 75,
    maxParticipants: 30,
    description: 'Intensive workshop focusing on advanced guard passing techniques.',
    participants: [
      { id: '2', name: 'Sarah Levy', belt: 'Purple Belt' }
    ]
  }
];

function ParticipantsList({ participants }: { participants: Array<{ name: string; belt: string }> }) {
  return (
    <div className="mt-4 space-y-2">
      {participants.map((participant, index) => (
        <div key={index} className="flex items-center justify-between bg-orange-50 p-2 rounded-md">
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

function EventsList() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upcoming Events & Workshops
        </h2>
        <div className="grid gap-6">
          {MOCK_EVENTS.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-orange-200 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.type === 'Competition'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {event.type}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{event.description}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>${event.price}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{event.participants.length} / {event.maxParticipants}</span>
                    </div>
                  </div>
                </div>
                <button className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                  Register
                </button>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <button 
                  onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  {selectedEvent === event.id ? 'Hide Participants' : 'Show Participants'}
                </button>
                
                {selectedEvent === event.id && (
                  <ParticipantsList participants={event.participants} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventsList;