import { ArrowLeft, ExternalLink, Mail, MapPin, Calendar, Briefcase, Building2, GraduationCap } from 'lucide-react';

function fallback(value) {
  return value && String(value).trim() ? value : '—';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function MetaItem({ Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          {label}
        </div>
        <div className="text-sm text-slate-700 break-words">{children}</div>
      </div>
    </div>
  );
}

export default function OfferDetailPanel({ offer, onBack }) {
  if (!offer) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
        Aucune offre sélectionnée.
      </div>
    );
  }

  const title = fallback(offer.title) === '—' ? offer.url : offer.title;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
      <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Retour à la liste"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-slate-400">#{offer.id}</div>
          <h2 className="text-xl font-semibold text-slate-900 break-words">{title}</h2>
          <div className="text-sm text-slate-500 mt-1">{fallback(offer.company)}</div>
        </div>
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors shrink-0"
        >
          Voir l'offre
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MetaItem Icon={Briefcase} label="Contrat">{fallback(offer.contract_type)}</MetaItem>
        <MetaItem Icon={Building2} label="Salaire">{fallback(offer.salary)}</MetaItem>
        <MetaItem Icon={GraduationCap} label="Campus">{fallback(offer.campus)}</MetaItem>
        <MetaItem Icon={Calendar} label="Disponibilité">{fallback(offer.availability)}</MetaItem>
        <MetaItem Icon={Calendar} label="Ajoutée le">{formatDate(offer.created_at)}</MetaItem>
        <MetaItem Icon={Mail} label="Contact">
          {offer.email ? (
            <a href={`mailto:${offer.email}`} className="text-blue-600 hover:text-blue-800">
              {offer.email}
            </a>
          ) : '—'}
        </MetaItem>
        <MetaItem Icon={MapPin} label="Adresse">{fallback(offer.address)}</MetaItem>
      </div>

      {(offer.short_description || offer.full_description) && (
        <div className="space-y-4 pt-5 border-t border-slate-100">
          {offer.short_description && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                Résumé
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {offer.short_description}
              </p>
            </div>
          )}
          {offer.full_description && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                Description complète
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {offer.full_description}
              </p>
            </div>
          )}
        </div>
      )}

      {(offer.expertises || offer.target) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-slate-100">
          {offer.expertises && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                Expertises
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">{offer.expertises}</p>
            </div>
          )}
          {offer.target && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                Profil ciblé
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">{offer.target}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
