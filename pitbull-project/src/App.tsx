// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, LogOut, Settings } from 'lucide-react';
import WeeklySchedule from './components/WeeklySchedule';
import EventsList from './components/EventsList';
import AdminPanel from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { useAuthStore } from './store/authStore';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();

  useEffect(() => {
  // Initialize auth state when the app loads
  useAuthStore.getState().initialize();
}, [])
  // Check if user is admin 
  const isAdmin = profile?.isAdmin === true;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">BJJ</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">BJJ Academy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'schedule'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'events'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Events
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'admin'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </button>
                )}
              </nav>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {profile?.name} ({profile?.belt})
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'schedule' && <WeeklySchedule />}
        {activeTab === 'events' && <EventsList />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
