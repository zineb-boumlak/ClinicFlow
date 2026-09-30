import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/helpers';

export default function Login() {
  const { user, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-emerald-100 px-8 py-10 lg:px-14">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold leading-none text-white"
          >
            +
          </span>
          <span className="text-lg font-bold text-emerald-950">ClinicFlow</span>
        </div>
        <div className="py-12">
          <h1 className="max-w-md text-3xl font-bold leading-tight text-emerald-950 lg:text-4xl">
            Les patients et les rendez-vous de la clinique, au même endroit.
          </h1>
          <p className="mt-4 max-w-sm text-emerald-900">
            Connectez-vous pour consulter le planning du jour et gérer les dossiers.
          </p>
        </div>
        <p className="hidden text-sm text-emerald-800 lg:block">Accès réservé au personnel.</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Connexion</h2>
            <p className="mt-1 text-sm text-slate-500">Saisissez vos identifiants.</p>
          </div>

          {error && (
            <div role="alert" className="alert-error">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
