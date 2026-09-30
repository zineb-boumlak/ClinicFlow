-- Nom affiché (ex : "Créé par ...") pour les utilisateurs
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
UPDATE users SET full_name = split_part(email, '@', 1) WHERE full_name IS NULL;