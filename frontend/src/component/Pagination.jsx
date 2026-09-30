export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2 text-sm text-slate-600">
      <span>
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        <button className="btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Précédent
        </button>
        <button
          className="btn-ghost"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
