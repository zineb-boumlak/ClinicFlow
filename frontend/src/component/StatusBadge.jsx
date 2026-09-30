const STYLES = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STYLES[status] || 'bg-slate-50 text-slate-700 ring-slate-200'}`}
    >
      {LABELS[status] || status}
    </span>
  );
}
