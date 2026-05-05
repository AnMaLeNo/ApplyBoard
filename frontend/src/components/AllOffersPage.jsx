import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import OfferDetailPanel from './OfferDetailPanel.jsx';
import OffersCatalogTable from './OffersCatalogTable.jsx';
import SlidePanel from './SlidePanel.jsx';

export default function AllOffersPage({ globalOffersState }) {
  const {
    offers,
    isLoading,
    errorMessage,
    limit,
    setLimit,
    refresh,
  } = globalOffersState;

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openOffer = (offer) => {
    setSelectedOffer(offer);
    setDetailOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100dvh-7rem)] space-y-6">
      <header className="flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Registre Global des Offres
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catalogue public des offres connues de la plateforme, triées par date d'ajout.
          </p>
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
        onOpenChange={setDetailOpen}
        canOpen={!!selectedOffer}
        secondaryKey={selectedOffer?.id ?? null}
        className="flex-1 min-h-0"
        primary={
          <OffersCatalogTable
            offers={offers}
            isLoading={isLoading}
            limit={limit}
            onChangeLimit={setLimit}
            onRefresh={refresh}
            onSelectOffer={openOffer}
          />
        }
        secondary={
          <OfferDetailPanel offer={selectedOffer} onBack={() => setDetailOpen(false)} />
        }
      />
    </div>
  );
}
