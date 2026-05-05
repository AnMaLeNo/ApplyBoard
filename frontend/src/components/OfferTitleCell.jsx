import { ExternalLink } from 'lucide-react';
import { fallback } from '../utils/format.js';

// Cellule "identité visuelle d'une offre" : titre cliquable (lien externe) + société.
// Le `e.stopPropagation()` permet d'ouvrir l'URL sans déclencher un éventuel
// `onClick` sur la ligne (cas de la table du catalogue navigable).
export default function OfferTitleCell({ offer, maxWidthClass = 'max-w-[320px]' }) {
  const displayTitle = fallback(offer.title) === '—' ? offer.url : offer.title;

  return (
    <td className={`px-4 py-3 ${maxWidthClass}`}>
      <a
        href={offer.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-start gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
        title={offer.title || offer.url}
      >
        <span className="line-clamp-2">{displayTitle}</span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      </a>
      <div className="text-xs text-slate-500 mt-1">{fallback(offer.company)}</div>
    </td>
  );
}
