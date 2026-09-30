import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../component/StatusBadge';
import { formatDate, formatDateTime, getErrorMessage } from '../utils/helpers';

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/patients/${id}`)
      .then((res) => {
        if (!active) return;
        setPatient(res.data.data);
        setError('');
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="text-slate-500">Chargement…</p>;

  if (error) {
    return (
      <div className="space-y-4">
        <div role="alert" className="alert-error">
          {error}
        </div>
        <Link to="/patients" className="btn-ghost">
          Retour aux patients
        </Link>
      </div>
    );
  }

  const infos = [
    { label: 'CIN', value: patient.cin },
    { label: 'Téléphone', value: patient.phone },
    { label: 'Date de naissance', value: formatDate(patient.birthDate) },
    { label: 'Adresse', value: patient.address || '—' },
    { label: 'Dossier créé le', value: formatDate(patient.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/patients" className="text-sm font-medium text-emerald-700 hover:underline">
            Retour aux patients
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">{patient.fullName}</h1>
        </div>
        <Link to={`/appointments?patientId=${patient.id}`} className="btn-primary">
          Planifier un rendez-vous
        </Link>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Informations</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {infos.map((info) => (
            <div key={info.label}>
              <dt className="text-sm text-slate-500">{info.label}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{info.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="px-6 pt-5 text-lg font-bold text-slate-800">
          Rendez-vous ({patient.appointments.length})
        </h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-6 py-3 font-semibold">Date et heure</th>
              <th className="px-6 py-3 font-semibold">Motif</th>
              <th className="px-6 py-3 font-semibold">Notes</th>
              <th className="px-6 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {patient.appointments.map((a) => (
              <tr key={a.id} className="border-t border-emerald-100">
                <td className="px-6 py-3">{formatDateTime(a.appointmentDate)}</td>
                <td className="px-6 py-3 font-medium text-slate-800">{a.reason}</td>
                <td className="px-6 py-3 text-slate-600">{a.notes || '—'}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
            {patient.appointments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  Aucun rendez-vous pour ce patient. Planifiez le premier rendez-vous.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
