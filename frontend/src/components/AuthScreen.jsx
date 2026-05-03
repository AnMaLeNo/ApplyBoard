import { AlertCircle } from 'lucide-react';

export default function AuthScreen({
  authMode,
  email,
  password,
  authError,
  setEmail,
  setPassword,
  toggleAuthMode,
  onSubmit,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
          {authMode === 'login' ? 'Authentification' : 'Création de compte'}
        </h1>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {authError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Identifiant (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Clé d'accès (Mot de passe)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            {authMode === 'login' ? 'Ouvrir la session' : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={toggleAuthMode}
          className="w-full text-sm text-slate-500 hover:text-slate-700 text-center transition-colors"
        >
          {authMode === 'login'
            ? 'Créer une nouvelle entité utilisateur'
            : "S'authentifier avec un compte existant"}
        </button>
      </div>
    </div>
  );
}
