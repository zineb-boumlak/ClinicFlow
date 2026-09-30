CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE role_enum AS ENUM ('admin', 'staff');
CREATE TYPE appointment_status_enum AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role role_enum NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    cin VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 1-N : un patient a plusieurs rendez-vous.
-- CASCADE : si un patient est réellement supprimé, ses rendez-vous le sont aussi.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status_enum NOT NULL DEFAULT 'pending',
    reason TEXT NOT NULL,
    notes TEXT,
    -- 1-N : un utilisateur crée plusieurs rendez-vous.
    -- RESTRICT : on ne supprime pas un utilisateur qui a créé des rendez-vous.
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recherche partielle (ILIKE '%...%') sur nom et CIN
CREATE INDEX idx_patients_fullname_trgm ON patients USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_patients_cin_trgm ON patients USING gin (cin gin_trgm_ops);

-- Rendez-vous d'un patient + vérification des conflits
CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date);
-- Filtre par date
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
-- Dashboard et filtre par statut
CREATE INDEX idx_appointments_status_date ON appointments (status, appointment_date);