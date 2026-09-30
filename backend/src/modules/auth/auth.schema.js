const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Email invalide').max(255),
    password: z
      .string()
      .min(6, 'Mot de passe au moins 6 caractères')
      .max(72, 'Mot de passe trop long'),
  }),
});

module.exports = { loginSchema };