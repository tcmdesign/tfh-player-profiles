import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import { AppConfigProvider } from './context/AppConfigContext';
import CompareToast from './components/CompareToast';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import PlayerPage from './pages/PlayerPage';
import ComparePage from './pages/ComparePage';

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppConfigProvider>
    <CompareProvider>
      {/* Mobile top bar */}
      <div className="fp-mobile-topbar">
        <button
          className="fp-hamburger"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 18, fontWeight: 800, letterSpacing: '1px',
          textTransform: 'uppercase', color: 'var(--fp-text)',
        }}>
          <span style={{
            background: 'var(--fp-orange-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>TFH</span> Profiles
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
      <CompareToast />
    </CompareProvider>
    </AppConfigProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell><LandingPage /></AppShell>} />
        <Route path="/player/:id" element={<AppShell><PlayerPage /></AppShell>} />
        <Route path="/compare" element={<AppShell><ComparePage /></AppShell>} />
      </Routes>
    </BrowserRouter>
  );
}
