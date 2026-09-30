const db = require('../../config/db');

const getStats = async () => {
  const res = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL)::int AS "totalPatients",
      (COUNT(*) FILTER (
        WHERE a.status <> 'cancelled'
          AND a.appointment_date >= date_trunc('day', now())
          AND a.appointment_date < date_trunc('day', now()) + interval '1 day'
      ))::int AS "todayAppointments",
      (COUNT(*) FILTER (WHERE a.status = 'pending'))::int AS "pendingAppointments",
      (COUNT(*) FILTER (WHERE a.status = 'confirmed'))::int AS "confirmedAppointments"
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE p.deleted_at IS NULL
  `);
  return res.rows[0];
};

module.exports = { getStats };
