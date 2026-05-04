import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth.js';
import { useOffers } from './hooks/useOffers.js';
import { useGlobalOffers } from './hooks/useGlobalOffers.js';
import AuthScreen from './components/AuthScreen.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardPage from './components/DashboardPage.jsx';
import AllOffersPage from './components/AllOffersPage.jsx';

export default function App() {
  const auth = useAuth();
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const offersState = useOffers({
    enabled: auth.authState !== 'out',
    onUnauthorized: auth.markUnauthenticated,
    onAuthenticated: auth.markAuthenticated,
  });
  const { reset: resetOffers } = offersState;

  const globalOffersState = useGlobalOffers({
    enabled: auth.authState !== 'out' && currentRoute === 'all_offers',
    onUnauthorized: auth.markUnauthenticated,
    onAuthenticated: auth.markAuthenticated,
  });
  const { reset: resetGlobalOffers } = globalOffersState;

  // Purge le registre local lorsque la session se ferme.
  useEffect(() => {
    if (auth.authState === 'out') {
      resetOffers();
      resetGlobalOffers();
    }
  }, [auth.authState, resetOffers, resetGlobalOffers]);

  if (auth.authState === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (auth.authState === 'out') {
    return (
      <AuthScreen
        authMode={auth.authMode}
        email={auth.email}
        password={auth.password}
        authError={auth.authError}
        setEmail={auth.setEmail}
        setPassword={auth.setPassword}
        toggleAuthMode={auth.toggleAuthMode}
        onSubmit={auth.submitAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onLogout={auth.logout}
      />
      <main className="px-8 pb-8">
        {currentRoute === 'dashboard' && <DashboardPage offersState={offersState} />}
        {currentRoute === 'all_offers' && (
          <AllOffersPage globalOffersState={globalOffersState} />
        )}
      </main>
    </div>
  );
}
