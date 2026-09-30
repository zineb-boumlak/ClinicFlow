export const getErrorMessage = (err) => {
  if (!err.response) {
    return 'Serveur injoignable. Vérifiez que le backend est lancé.';
  }
  return err.response.data?.message || 'Une erreur est survenue';
};

const toDate = (value) => {
  if (!value) return null;
  const text = String(value);
  // "AAAA-MM-JJ" sans heure : on évite le décalage de fuseau horaire
  const date = new Date(text.length === 10 ? `${text}T00:00:00` : text);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
  const date = toDate(value);
  return date ? date.toLocaleDateString('fr-FR', { dateStyle: 'medium' }) : '—';
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
};
