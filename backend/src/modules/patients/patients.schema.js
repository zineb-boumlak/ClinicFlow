const { z } = require('zod');


const optionalOrEmpty = (schema) => schema.optional().or(z.literal(''));

const birthDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format AAAA-MM-JJ requise')
  .refine((value) => {
    const date = new Date(value);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      date <= new Date()
    );
  }, 'Date de naissance invalide');

const createPatientSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(255),
    cin: z.string().trim().min(3, 'CIN valide requis').max(50),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s().-]{8,20}$/, 'Numéro de téléphone invalide'),
    birthDate,
    address: z.string().trim().max(500).optional(),
  }),
});

const listPatientsSchema = z.object({
  query: z.object({
    search: optionalOrEmpty(z.string().max(100, 'Recherche trop longue')),
    page: optionalOrEmpty(z.string().regex(/^[1-9]\d*$/, 'page invalide')),
    limit: optionalOrEmpty(z.string().regex(/^[1-9]\d*$/, 'limit invalide')),
  }),
});

const patientIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Identifiant patient invalide'),
  }),
});

module.exports = { createPatientSchema, listPatientsSchema, patientIdSchema };