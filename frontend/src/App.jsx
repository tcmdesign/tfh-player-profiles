import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import { AppConfigProvider } from './context/AppConfigContext';
import CompareToast from './components/CompareToast';
import LandingPage from './pages/LandingPage';
import PlayerPage from './pages/PlayerPage';
import ComparePage from './pages/ComparePage';

function AppShell({ children }) {
  return (
    <AppConfigProvider>
    <CompareProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
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
