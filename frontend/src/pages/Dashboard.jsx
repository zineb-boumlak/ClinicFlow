import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../utils/helpers';

const SECONDARY_STATS = [
  { key: 'totalPatients', label: 'Patients enregistrés' },
  { key: 'pendingAppointments', label: 'Rendez-vous en attente' },
  { key: 'confirmedAppointments', label: 'Rendez-vous confirmés' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const value = (key) => (stats ? stats[key] : '–');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
          <p className="text-sm text-slate-500">L'activité de la clinique en un coup d'œil.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/patients" className="btn-ghost">
            Voir les patients
          </Link>
          <Link to="/appointments" className="btn-primary">
            Voir les rendez-vous
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-emerald-100 p-6 lg:row-span-1">
          <p className="text-sm font-medium text-emerald-900">Rendez-vous du jour</p>
          <p className="mt-3 text-6xl font-bold text-emerald-950">{value('todayAppointments')}</p>
          <p className="mt-2 text-sm text-emerald-900">Les rendez-vous annulés ne sont pas comptés.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {SECONDARY_STATS.map((stat) => (
            <div key={stat.key} className="card p-5">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-800">{value(stat.key)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
