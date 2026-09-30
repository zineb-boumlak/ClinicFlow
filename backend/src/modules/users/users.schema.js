const { z } = require('zod');

const ROLES = ['admin', 'staff'];

const role = z.enum(ROLES, { message: 'Rôle invalide (admin ou staff)' });
const id = z.string().uuid('Identifiant utilisateur invalide');
const email = z.string().trim().toLowerCase().email('Email invalide').max(255);
const fullName = z.string().trim().min(2, 'Nom trop court').max(255);
const password = z.string().min(8, 'Mot de passe : 8 caractères minimum').max(72);

const createUserSchema = z.object({
  body: z.object({ fullName, email, password, role: role.default('staff') }),
});

const updateUserSchema = z.object({
  params: z.object({ id }),
  body: z
    .object({
      fullName: fullName.optional(),
      email: email.optional(),
      password: password.optional(),
      role: role.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, 'Aucune donnée à modifier'),
});

const userIdSchema = z.object({ params: z.object({ id }) });

module.exports = { createUserSchema, updateUserSchema, userIdSchema };