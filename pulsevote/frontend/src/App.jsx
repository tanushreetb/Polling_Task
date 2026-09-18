import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreatePoll } from './pages/CreatePoll';
import { Vote } from './pages/Vote';
import { LiveResults } from './components/LiveResults';
import { HostDashboard } from './pages/HostDashboard';
import { ExplorePolls } from './pages/ExplorePolls';
import { MobileView } from './components/MobileView';
import { CursorGlow } from './components/CursorGlow';
import { FloatingDock } from './components/FloatingDock';
import { Smartphone, Monitor, Sparkles, X } from 'lucide-react';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'explore' | 'vote' | 'results' | 'dashboard' | 'create' | 'mobile' | 'how-it-works'
  const [selectedPollId, setSelectedPollId] = useState('65f1a0b1c2d3e4f5a6b7c8d1');
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null

  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-charcoal flex flex-col justify-between selection:bg-highlight">
      {/* Living Green Cursor Tracking & Specular Glow from ThreeUI */}
      <CursorGlow />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onOpenLogin={() => setAuthModal('login')}
      />

      {/* Main Routed Content */}
      <main className="flex-1 pb-28 sm:pb-32">
        {currentView === 'home' && (
          <Home
            setView={setCurrentView}
            onOpenLogin={() => setAuthModal('login')}
          />
        )}

        {currentView === 'explore' && (
          <ExplorePolls
            onSelectPoll={(poll) => {
              setSelectedPollId(poll.id);
              setCurrentView('vote');
            }}
            onPollResults={(id) => {
              setSelectedPollId(id);
              setCurrentView('results');
            }}
            onOpenCreate={() => setCurrentView('create')}
          />
        )}

        {currentView === 'vote' && (
          <Vote
            pollId={selectedPollId}
            onBack={() => setCurrentView('explore')}
            onVoteSubmitted={(id) => {
              setSelectedPollId(id);
              setCurrentView('results');
            }}
          />
        )}

        {currentView === 'results' && (
          <LiveResults
            pollId={selectedPollId}
            onBack={() => setCurrentView('vote')}
          />
        )}

        {currentView === 'dashboard' && (
          <HostDashboard
            setView={setCurrentView}
            onSelectPoll={(poll) => {
              setSelectedPollId(poll.id);
              setCurrentView('vote');
            }}
            onPollResults={(id) => {
              setSelectedPollId(id);
              setCurrentView('results');
            }}
          />
        )}

        {currentView === 'create' && (
          <CreatePoll
            onPollCreated={(newPoll) => {
              setSelectedPollId(newPoll.id);
              setCurrentView('vote');
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'mobile' && (
          <div className="py-8 px-4 flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-forest-900 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
                Screen Preview
              </span>
              <h2 className="text-2xl font-extrabold text-charcoal mt-1">Mobile Interactive Experience</h2>
            </div>
            <MobileView
              onSelectPoll={(p) => {
                setSelectedPollId(p.id);
                setCurrentView('vote');
              }}
              onOpenCreate={() => setCurrentView('create')}
            />
          </div>
        )}
      </main>

      {/* Auth Modal (Login / Register) */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setAuthModal(null)}
              className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-white border border-[#D9D3C7] flex items-center justify-center shadow-md hover:bg-stone-100 text-charcoal"
            >
              <X className="w-4 h-4" />
            </button>

            {authModal === 'login' ? (
              <Login
                onSwitchToRegister={() => setAuthModal('register')}
                onClose={() => setAuthModal(null)}
                onSuccess={() => {
                  setAuthModal(null);
                  setCurrentView('dashboard');
                }}
              />
            ) : (
              <Register
                onSwitchToLogin={() => setAuthModal('login')}
                onClose={() => setAuthModal(null)}
                onSuccess={() => {
                  setAuthModal(null);
                  setCurrentView('dashboard');
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Floating ThreeUI Sylva Glass Dock Navigator (Centered, Non-Clipping) */}
      <aside aria-label="Evaluation Screen Switcher" className="fixed bottom-4 inset-x-0 z-40 flex justify-center items-center px-3 pointer-events-none">
        <div className="pointer-events-auto max-w-full overflow-x-auto py-1 px-1 flex justify-center">
          <FloatingDock
            currentView={currentView}
            setView={setCurrentView}
            onOpenCreate={() => setCurrentView('create')}
            showAllScreens={true}
          />
        </div>
      </aside>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </AuthProvider>
  );
}
