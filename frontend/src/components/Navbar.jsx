import { LayoutDashboard, Database, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { route: 'dashboard', label: "Suivi d'Entités", Icon: LayoutDashboard },
  { route: 'all_offers', label: 'Registre Global', Icon: Database },
];

export default function Navbar({ currentRoute, onNavigate, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 mb-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="text-lg font-bold text-slate-800 tracking-tight">
          Système de Gestion
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {NAV_ITEMS.map(({ route, label, Icon }) => (
              <button
                key={route}
                onClick={() => onNavigate(route)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === route
                    ? 'bg-slate-100 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
