import { AlertCircle, Loader2 } from 'lucide-react';
import SlidePanel from './SlidePanel.jsx';

// Layout réutilisable pour une page "liste maître + détail latéral".
// - `table` (slot)   : contenu primaire (table de listing).
// - `detail` (slot)  : contenu secondaire (panneau détail).
// - hauteur fixe sous la Navbar pour permettre les scrolls indépendants des slots.
export default function MasterDetailLayout({
  title,
  subtitle,
  isLoading,
  errorMessage,
  detailOpen,
  onDetailOpenChange,
  canOpenDetail,
  detailKey,
  table,
  detail,
}) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100dvh-7rem)] space-y-6">
      <header className="flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {isLoading && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
      </header>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 shrink-0">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-sm font-medium">
            Erreur d'exécution de la requête : {errorMessage}
          </div>
        </div>
      )}

      <SlidePanel
        open={detailOpen}
        onOpenChange={onDetailOpenChange}
        canOpen={canOpenDetail}
        secondaryKey={detailKey}
        className="flex-1 min-h-0"
        primary={table}
        secondary={detail}
      />
    </div>
  );
}
