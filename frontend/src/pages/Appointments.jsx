import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../component/Modal';
import StatusBadge from '../component/StatusBadge';
import { formatDateTime, getErrorMessage } from '../utils/helpers';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
];

const emptyForm = (patientId = '') => ({
  patientId,
  appointmentDate: '',
  status: 'pending',
  reason: '',
  notes: '',
});

export default function Appointments() {
  const [searchParams] = useSearchParams();
  const presetPatientId = searchParams.get('patientId') || '';

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(Boolean(presetPatientId));
  const [form, setForm] = useState(emptyForm(presetPatientId));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/appointments', {
        params: {
          date: dateFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setAppointments(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Liste des patients pour le formulaire (100 premiers, triés du plus récent)
  useEffect(() => {
    api
      .get('/patients', { params: { limit: 100 } })
      .then((res) => setPatients(res.data.data.patients))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const openCreate = () => {
    setForm(emptyForm(presetPatientId));
    setFormError('');
    setFormOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/appointments', {
        patientId: form.patientId,
        // L'heure saisie est locale : on l'envoie en ISO (UTC) pour éviter les décalages
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        status: form.status,
        reason: form.reason,
        notes: form.notes || undefined,
      });
      setFormOpen(false);
      await loadAppointments();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setError('');
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      await loadAppointments();
    } catch (err) {
      // Par exemple : conflit de 30 minutes avec un autre rendez-vous confirmé
      setError(getErrorMessage(err));
    }
  };

  const resetFilters = () => {
    setDateFilter('');
    setStatusFilter('');
  };

  const hasFilters = Boolean(dateFilter || statusFilter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rendez-vous</h1>
          <p className="text-sm text-slate-500">{appointments.length} rendez-vous affiché(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          Planifier un rendez-vous
        </button>
      </div>

      <div className="card flex flex-wrap items-end gap-4 p-4">
        <div>
          <label htmlFor="filterDate" className="label">
            Date
          </label>
          <input
            id="filterDate"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="filterStatus" className="label">
            Statut
          </label>
          <select
            id="filterStatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button onClick={resetFilters} className="btn-ghost">
            Effacer les filtres
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Date et heure</th>
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Motif</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Changer le statut</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t border-emerald-100">
                <td className="px-4 py-3">{formatDateTime(a.appointmentDate)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/patients/${a.patientId}`}
                    className="font-medium text-emerald-800 hover:underline"
                  >
                    {a.patientName}
                  </Link>
                </td>
                <td className="px-4 py-3">{a.reason}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Changer le statut du rendez-vous de ${a.patientName}`}
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    className="input w-40"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {hasFilters
                    ? 'Aucun rendez-vous pour ces filtres.'
                    : 'Aucun rendez-vous pour le moment. Planifiez le premier rendez-vous.'}
                </td>
              </tr>
            )}
            {loading && appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <Modal title="Planifier un rendez-vous" onClose={() => setFormOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div role="alert" className="alert-error">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="patientId" className="label">
                Patient
              </label>
              <select
                id="patientId"
                value={form.patientId}
                onChange={setField('patientId')}
                required
                className="input"
              >
                <option value="">Choisir un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.cin})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="appointmentDate" className="label">
                  Date et heure
                </label>
                <input
                  id="appointmentDate"
                  type="datetime-local"
                  value={form.appointmentDate}
                  onChange={setField('appointmentDate')}
                  required
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="status" className="label">
                  Statut
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={setField('status')}
                  className="input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="label">
                Motif
              </label>
              <input
                id="reason"
                value={form.reason}
                onChange={setField('reason')}
                required
                minLength={2}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="notes" className="label">
                Notes (facultatif)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={setField('notes')}
                className="input"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
