import { useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';

const EMPTY = { fullName: '', email: '', password: '', role: 'staff' };

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200';

const errorMessage = (err) =>
  err.response?.data?.message || 'Une erreur est survenue. Réessayez.';

export default function Users() {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ fullName: u.fullName || '', email: u.email, password: '', role: u.role });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      // En modification, un mot de passe vide = on ne le change pas
      if (editingId && !payload.password) delete payload.password;

      if (editingId) await api.put(`/users/${editingId}`, payload);
      else await api.post('/users', payload);

      closeForm();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Supprimer l'utilisateur ${u.fullName || u.email} ?`)) return;
    setError('');
    try {
      await api.delete(`/users/${u.id}`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] font-bold text-slate-800">
            Utilisateurs
          </h1>
          <p className="text-sm text-slate-500">Gérez les comptes admin et staff de la clinique.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-xl border border-emerald-100 bg-white p-4 sm:p-6 md:grid-cols-2"
        >
          <h2 className="text-lg font-semibold text-slate-800 md:col-span-2">
            {editingId ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
          </h2>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            Nom complet
            <input name="fullName" value={form.fullName} onChange={handleChange} required minLength={2} className={inputClass} />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            {editingId ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!editingId}
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            Rôle
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={editingId === me.id}
              className={inputClass}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
            <button type="button" onClick={closeForm} className="btn-ghost">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : users.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Aucun utilisateur. Ajoutez le premier compte.
        </p>
      ) : (
        <>
          {/* Tableau (≥ md) */}
          <div className="hidden overflow-x-auto rounded-xl border border-emerald-100 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{u.fullName || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <Actions u={u} me={me} onEdit={openEdit} onDelete={handleDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes (< md) */}
          <ul className="space-y-3 md:hidden">
            {users.map((u) => (
              <li key={u.id} className="space-y-2 rounded-xl border border-emerald-100 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{u.fullName || '—'}</p>
                    <p className="truncate text-sm text-slate-500">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
                <Actions u={u} me={me} onEdit={openEdit} onDelete={handleDelete} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        role === 'admin' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {role}
    </span>
  );
}

function Actions({ u, me, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={() => onEdit(u)} className="btn-ghost">
        Modifier
      </button>
      {u.id !== me.id && (
        <button onClick={() => onDelete(u)} className="btn-ghost text-red-700">
          Supprimer
        </button>
      )}
    </div>
  );
}