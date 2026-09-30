# ClinicFlow

Application web de gestion de clinique : patients, rendez-vous, utilisateurs (admin / staff) et tableau de bord.

## Technologies

- React (Vite, React Router, Axios, Tailwind CSS)
- Node.js
- Express
- PostgreSQL
- JWT (authentification) + bcrypt (hash des mots de passe)
- Zod (validation des entrées)
- Docker Compose (frontend + backend + PostgreSQL)

### Relations

| Relation | Type | Justification |

| `patients` → `appointments` | 1-N | Un patient a plusieurs rendez-vous ; un rendez-vous concerne un seul patient. `ON DELETE CASCADE` : un rendez-vous n'a pas de sens sans son patient. |
| `users` → `appointments` (`created_by`) | 1-N | Un utilisateur crée plusieurs rendez-vous. `ON DELETE RESTRICT` : on garde la traçabilité « créé par », donc un utilisateur qui a créé des rendez-vous ne peut pas être supprimé. |
| N-N / 1-1 | aucune | Pas de besoin métier : le rôle est un simple attribut (ENUM) de `users`. |

![ERD](docs/ERD.pdf)

## Installation

Prérequis : Node.js 18+ et PostgreSQL 14+ (ou Docker).

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Avec Docker (alternative)

```bash
docker compose up --build
docker compose exec backend npm run seed
```

Frontend : http://localhost:3000 - API : http://localhost:5000/api.
Les migrations sont appliquées automatiquement au premier démarrage.
`docker compose down -v` supprime la base pour repartir de zéro.

## Environment variables

See `backend/.env.example`.

| Variable | Description | Défaut |
|---|---|---|
| `NODE_ENV` | `development` ou `production` | `development` |
| `PORT` | Port de l'API | `4000` |
| `DATABASE_URL` | Connexion PostgreSQL | `postgresql://clinicflow:clinicflow@localhost:5432/clinicflow` |
| `JWT_SECRET` | Secret JWT (32 caractères minimum en production : `openssl rand -hex 32`) | secret de dev |
| `JWT_EXPIRES_IN` | Durée du token | `1d` |
| `BCRYPT_ROUNDS` | Coût du hachage | `10` |
| `CORS_ORIGIN` | Origines autorisées (séparées par des virgules) | `http://localhost:5173,http://127.0.0.1:5173` |

Frontend : `VITE_API_URL` (défaut `http://localhost:4000/api`).

## Database

- Migrations : `backend/src/database/migrations/`

```bash
createdb clinicflow
psql -d clinicflow -f backend/src/database/migrations/001_init.sql
psql -d clinicflow -f backend/src/database/migrations/002_users_full_name.sql
cd backend && npm run seed     # 1 admin, 2 staff, 5 patients, 10 rendez-vous
```

Règle métier : un patient ne peut pas avoir deux rendez-vous **confirmés** à moins de 30 minutes d'écart
(réponse `409 Conflict`).

## Test accounts

Admin:
- Email : admin@clinic.com
- Mot de passe : password123

Staff 1:
- Email : staff1@clinic.com
- Mot de passe : password123

Staff 2:
- Email : staff2@clinic.com
- Mot de passe : password123