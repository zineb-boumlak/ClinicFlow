import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const LINKS = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/patients', label: 'Patients' },
  { to: '/appointments', label: 'Rendez-vous' },
  { to: '/users', label: 'Utilisateurs', adminOnly: true },
];

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-emerald-100 text-emerald-900'
      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
  }`;

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const links = LINKS.filter((l) => !l.adminOnly || user.role === 'admin');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold leading-none text-white"
            >
              +
            </span>
            <span className="text-lg font-bold text-slate-800">ClinicFlow</span>
          </div>

          {/* Sur mobile : la navigation passe sur sa propre ligne et défile horizontalement */}
          <nav
            className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto px-1 md:order-none md:w-auto md:overflow-visible"
            aria-label="Navigation principale"
          >
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">
              {user.email}
              <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {user.role}
              </span>
            </span>
            <button onClick={logout} className="btn-ghost">
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}