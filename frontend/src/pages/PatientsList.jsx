import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Modal from '../component/Modal';
import Pagination from '../component/Pagination';
import { formatDate, getErrorMessage } from '../utils/helpers';

const EMPTY_FORM = { fullName: '', cin: '', phone: '', birthDate: '', address: '' };

export default function PatientsList() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Attend 300 ms après la dernière frappe avant de lancer la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/patients', {
        params: { search: debouncedSearch, page, limit: 10 },
      });
      setPatients(res.data.data.patients);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      fullName: patient.fullName,
      cin: patient.cin,
      phone: patient.phone,
      birthDate: String(patient.birthDate).slice(0, 10),
      address: patient.address || '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
      } else {
        await api.post('/patients', form);
      }
      setFormOpen(false);
      await loadPatients();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Supprimer le patient ${patient.fullName} ?`)) return;
    try {
      await api.delete(`/patients/${patient.id}`);
      if (patients.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadPatients();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-sm text-slate-500">{pagination.total} patient(s) enregistré(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            aria-label="Rechercher un patient"
            placeholder="Rechercher par nom ou CIN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input sm:w-64"
          />
          <button onClick={openCreate} className="btn-primary">
            Ajouter un patient
          </button>
        </div>
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
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">CIN</th>
              <th className="px-4 py-3 font-semibold">Téléphone</th>
              <th className="px-4 py-3 font-semibold">Naissance</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t border-emerald-100">
                <td className="px-4 py-3 font-medium text-slate-800">{p.fullName}</td>
                <td className="px-4 py-3">{p.cin}</td>
                <td className="px-4 py-3">{p.phone}</td>
                <td className="px-4 py-3">{formatDate(p.birthDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/patients/${p.id}`} className="btn-ghost">
                      Détails
                    </Link>
                    <button onClick={() => openEdit(p)} className="btn-ghost">
                      Modifier
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(p)} className="btn-danger">
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && patients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {debouncedSearch
                    ? 'Aucun patient ne correspond à cette recherche.'
                    : 'Aucun patient pour le moment. Ajoutez le premier patient.'}
                </td>
              </tr>
            )}
            {loading && patients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />

      {formOpen && (
        <Modal
          title={editingId ? 'Modifier le patient' : 'Ajouter un patient'}
          onClose={() => setFormOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div role="alert" className="alert-error">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="label">
                Nom complet
              </label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={setField('fullName')}
                required
                className="input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cin" className="label">
                  CIN
                </label>
                <input
                  id="cin"
                  value={form.cin}
                  onChange={setField('cin')}
                  required
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Téléphone
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={setField('phone')}
                  required
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birthDate" className="label">
                Date de naissance
              </label>
              <input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={setField('birthDate')}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="address" className="label">
                Adresse (facultatif)
              </label>
              <input
                id="address"
                value={form.address}
                onChange={setField('address')}
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
