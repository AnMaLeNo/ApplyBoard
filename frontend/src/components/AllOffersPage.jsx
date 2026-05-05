import { useState } from 'react';
import OfferDetailPanel from './OfferDetailPanel.jsx';
import OffersCatalogTable from './OffersCatalogTable.jsx';
import MasterDetailLayout from './MasterDetailLayout.jsx';

export default function AllOffersPage({ globalOffersState }) {
  const {
    offers,
    isLoading,
    errorMessage,
    limit,
    setLimit,
    refresh,
  } = globalOffersState;

  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Identique à DashboardPage : on stocke uniquement l'ID, on dérive l'offre depuis
  // la liste courante. Garantit la cohérence si la liste se rafraîchit côté hook.
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? null;

  const handleSelectOffer = (offer) => {
    setSelectedOfferId(offer.id);
    setDetailOpen(true);
  };

  return (
    <MasterDetailLayout
      title="Registre Global des Offres"
      subtitle="Catalogue public des offres connues de la plateforme, triées par date d'ajout."
      isLoading={isLoading}
      errorMessage={errorMessage}
      detailOpen={detailOpen}
      onDetailOpenChange={setDetailOpen}
      canOpenDetail={selectedOffer != null}
      detailKey={selectedOfferId}
      table={
        <OffersCatalogTable
          offers={offers}
          isLoading={isLoading}
          limit={limit}
          onChangeLimit={setLimit}
          onRefresh={refresh}
          onSelectOffer={handleSelectOffer}
        />
      }
      detail={
        <OfferDetailPanel offer={selectedOffer} onBack={() => setDetailOpen(false)} />
      }
    />
  );
}
