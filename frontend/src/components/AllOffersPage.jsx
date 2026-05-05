import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { AlertCircle, ExternalLink, Loader2, RefreshCw, Database } from 'lucide-react';
import OfferDetailPanel from './OfferDetailPanel.jsx';

const LIMIT_OPTIONS = [25, 50, 100, 250, 500];
const DRAG_OFFSET_RATIO = 0.2;
const DRAG_VELOCITY_THRESHOLD = 500;
const WHEEL_END_DELAY_MS = 140;
const SPRING = { type: 'spring', stiffness: 350, damping: 35 };

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function fallback(value) {
  return value && String(value).trim() ? value : '—';
}

function CatalogTable({
  offers,
  isLoading,
  limit,
  setLimit,
  refresh,
  onSelectOffer,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Catalogue ({offers.length})
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1.5"
          >
            {LIMIT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                Limite : {value}
              </option>
            ))}
          </select>

          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Offre</th>
              <th className="px-4 py-3 font-semibold">Contrat</th>
              <th className="px-4 py-3 font-semibold">Campus</th>
              <th className="px-4 py-3 font-semibold">Date d'ajout</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center text-slate-400">
                  <Database className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  Aucune offre référencée dans le catalogue.
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr
                  key={offer.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectOffer(offer)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectOffer(offer);
                    }
                  }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top cursor-pointer focus:outline-none focus:bg-slate-50"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">
                    {offer.id}
                  </td>
                  <td className="px-4 py-3 max-w-[320px]">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-start gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                      title={offer.title || offer.url}
                    >
                      <span className="line-clamp-2">
                        {fallback(offer.title) === '—' ? offer.url : offer.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    </a>
                    <div className="text-xs text-slate-500 mt-1">{fallback(offer.company)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{fallback(offer.contract_type)}</div>
                    {offer.salary && (
                      <div className="text-xs text-slate-500 mt-1">{offer.salary}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{fallback(offer.campus)}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(offer.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AllOffersPage({ globalOffersState }) {
  const {
    offers,
    isLoading,
    errorStatus,
    limit,
    setLimit,
    refresh,
  } = globalOffersState;

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [currentPanel, setCurrentPanel] = useState('list'); // 'list' | 'detail'

  const viewportRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const x = useMotionValue(0);
  const animationRef = useRef(null);

  // Refs pour lire l'état le plus récent depuis les handlers d'event natifs.
  const panelRef = useRef(currentPanel);
  const widthRef = useRef(viewportWidth);
  const selectedRef = useRef(selectedOffer);
  useEffect(() => { panelRef.current = currentPanel; }, [currentPanel]);
  useEffect(() => { widthRef.current = viewportWidth; }, [viewportWidth]);
  useEffect(() => { selectedRef.current = selectedOffer; }, [selectedOffer]);

  const targetXFor = (panel, width) => (panel === 'detail' ? -width : 0);

  const springTo = (panel) => {
    const w = widthRef.current;
    if (!w) return;
    animationRef.current?.stop();
    animationRef.current = animate(x, targetXFor(panel, w), SPRING);
  };

  // Mesure de la largeur (responsive).
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => setViewportWidth(node.offsetWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Anime vers le panneau courant à chaque changement (clic, swipe, wheel).
  useEffect(() => {
    if (!viewportWidth) return;
    animationRef.current?.stop();
    animationRef.current = animate(x, targetXFor(currentPanel, viewportWidth), SPRING);
  }, [currentPanel, viewportWidth, x]);

  // Trackpad : balayage horizontal à deux doigts (events `wheel` avec deltaX).
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    let active = false;
    let endTimer = null;

    const handleEnd = () => {
      active = false;
      const w = widthRef.current;
      if (!w) return;
      const current = x.get();
      const midpoint = -w / 2;
      const target = current < midpoint ? 'detail' : 'list';

      if (target === 'detail' && !selectedRef.current) {
        springTo('list');
        return;
      }
      if (target === panelRef.current) {
        springTo(target); // même panneau : on remet en place sans changer le state
      } else {
        setCurrentPanel(target); // déclenche l'effet ci-dessus
      }
    };

    const onWheel = (event) => {
      // On ne capture que les gestes à dominante horizontale.
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      // Pas de détail : on laisse le scroll natif passer.
      if (!selectedRef.current) return;

      event.preventDefault();
      const w = widthRef.current;
      if (!w) return;

      if (!active) {
        animationRef.current?.stop();
        active = true;
      }

      // Sur trackpad macOS : swipe gauche → deltaX > 0 → rail recule (x diminue).
      let next = x.get() - event.deltaX;
      const min = -w;
      const max = 0;
      // Effet caoutchouc hors limites.
      if (next < min) next = min + (next - min) * 0.2;
      else if (next > max) next = max + (next - max) * 0.2;
      x.set(next);

      clearTimeout(endTimer);
      endTimer = setTimeout(handleEnd, WHEEL_END_DELAY_MS);
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', onWheel);
      clearTimeout(endTimer);
    };
  }, [x]);

  // Échap pour revenir à la liste.
  useEffect(() => {
    if (currentPanel !== 'detail') return;
    const handler = (e) => {
      if (e.key === 'Escape') setCurrentPanel('list');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPanel]);

  const openDetail = (offer) => {
    setSelectedOffer(offer);
    setCurrentPanel('detail');
  };

  const closeDetail = () => {
    setCurrentPanel('list');
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = viewportWidth * DRAG_OFFSET_RATIO;
    const swiped =
      Math.abs(offset) > threshold || Math.abs(velocity) > DRAG_VELOCITY_THRESHOLD;

    if (!swiped) return;

    if (currentPanel === 'list' && offset < 0 && selectedOffer) {
      setCurrentPanel('detail');
    } else if (currentPanel === 'detail' && offset > 0) {
      setCurrentPanel('list');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
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

      {errorStatus && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-sm font-medium">
            Erreur d'exécution de la requête : {errorStatus}
          </div>
        </div>
      )}

      <div ref={viewportRef} className="overflow-hidden touch-pan-y">
        <motion.div
          className="flex"
          style={{ width: '200%', x }}
          drag={selectedOffer ? 'x' : false}
          dragConstraints={{ left: -viewportWidth, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragStart={() => animationRef.current?.stop()}
          onDragEnd={handleDragEnd}
        >
          <div className="w-1/2 shrink-0 pr-2">
            <CatalogTable
              offers={offers}
              isLoading={isLoading}
              limit={limit}
              setLimit={setLimit}
              refresh={refresh}
              onSelectOffer={openDetail}
            />
          </div>
          <div className="w-1/2 shrink-0 pl-2">
            <OfferDetailPanel offer={selectedOffer} onBack={closeDetail} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
