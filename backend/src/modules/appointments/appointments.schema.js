const { z } = require('zod');

const STATUSES = ['pending', 'confirmed', 'cancelled'];

// Accepte aussi la valeur vide (ex : ?date=&status=)
const optionalOrEmpty = (schema) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const uuid = (message) => z.string().uuid(message);

const status = z.enum(STATUSES, {
  message: 'Statut invalide (pending, confirmed ou cancelled)',
});

const createAppointmentSchema = z.object({
  body: z.object({
    patientId: uuid('Identifiant patient invalide'),
    appointmentDate: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Date et heure invalides'),
    status: status.optional(),
    reason: z.string().trim().min(2, 'Le motif est requis').max(500),
    notes: z.string().trim().max(2000).optional(),
  }),
});

const listAppointmentsSchema = z.object({
  query: z.object({
    date: optionalOrEmpty(
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format AAAA-MM-JJ)')
    ),
    status: optionalOrEmpty(status),
    patientId: optionalOrEmpty(uuid('Identifiant patient invalide')),
  }),
});

const updateStatusSchema = z.object({
  params: z.object({
    id: uuid('Identifiant rendez-vous invalide'),
  }),
  body: z.object({
    status,
  }),
});

module.exports = {
  createAppointmentSchema,
  listAppointmentsSchema,
  updateStatusSchema,
};
