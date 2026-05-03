import { CheckCircle2, Circle } from 'lucide-react';

export default function StatusToggle({ status, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
        status
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
      } disabled:opacity-50 disabled:cursor-wait`}
    >
      {status ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}
