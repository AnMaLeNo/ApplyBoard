import { useState } from 'react';
import OffersTable from './OffersTable.jsx';
import OfferDetailPanel from './OfferDetailPanel.jsx';
import MasterDetailLayout from './MasterDetailLayout.jsx';
import StatusToggle from './StatusToggle.jsx';

export default function DashboardPage({ offersState }) {
  const {
    offers,
    isLoading,
    errorMessage,
    filterApply,
    filterAnswer,
    limit,
    setFilterApply,
    setFilterAnswer,
    setLimit,
    refresh,
    updateOffer,
    deleteOffer,
  } = offersState;

  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Dérivé : permet à la vue détail de refléter automatiquement les mutations
  // (toggle apply/answer) sans avoir à dupliquer l'offre dans un state local.
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? null;

  const handleSelectOffer = (offer) => {
    setSelectedOfferId(offer.id);
    setDetailOpen(true);
  };

  const handleToggleStatus = (field, current) => {
    if (selectedOfferId == null) return;
    updateOffer(selectedOfferId, { [field]: !current });
  };

  const detailActions = selectedOffer && (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold mr-2">
        Statut
      </span>
      <StatusToggle
        status={selectedOffer.apply}
        label={selectedOffer.apply ? 'Postulé' : 'En attente'}
        onClick={() => handleToggleStatus('apply', selectedOffer.apply)}
        disabled={isLoading}
      />
      <StatusToggle
        status={selectedOffer.answer}
        label={selectedOffer.answer ? 'Reçu' : 'Sans réponse'}
        onClick={() => handleToggleStatus('answer', selectedOffer.answer)}
        disabled={isLoading}
      />
    </div>
  );

  return (
    <MasterDetailLayout
      title="Suivi des Candidatures"
      subtitle="Interface d'interaction avec le service d'agrégation d'offres 42."
      isLoading={isLoading}
      errorMessage={errorMessage}
      detailOpen={detailOpen}
      onDetailOpenChange={setDetailOpen}
      canOpenDetail={selectedOffer != null}
      detailKey={selectedOfferId}
      table={
        <OffersTable
          offers={offers}
          isLoading={isLoading}
          filterApply={filterApply}
          filterAnswer={filterAnswer}
          limit={limit}
          onChangeApplyFilter={setFilterApply}
          onChangeAnswerFilter={setFilterAnswer}
          onChangeLimit={setLimit}
          onRefresh={refresh}
          onSelectOffer={handleSelectOffer}
          onDelete={deleteOffer}
        />
      }
      detail={
        <OfferDetailPanel
          offer={selectedOffer}
          onBack={() => setDetailOpen(false)}
          actions={detailActions}
        />
      }
    />
  );
}
