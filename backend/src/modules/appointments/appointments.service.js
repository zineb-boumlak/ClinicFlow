const db = require('../../config/db');
const AppError = require('../../utils/AppError');

const CONFLICT_WINDOW_MINUTES = 30;

const withPatientLock = async (patientId, fn) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1::text))', [patientId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const checkConflict = async (client, patientId, appointmentDate, currentAppointmentId = null) => {
  const res = await client.query(
    `SELECT id FROM appointments
     WHERE patient_id = $1
       AND status = 'confirmed'
       AND appointment_date > ($2::timestamptz - make_interval(mins => $3::int))
       AND appointment_date < ($2::timestamptz + make_interval(mins => $3::int))
       AND ($4::uuid IS NULL OR id <> $4::uuid)
     LIMIT 1`,
    [patientId, appointmentDate, CONFLICT_WINDOW_MINUTES, currentAppointmentId]
  );

  if (res.rows.length > 0) {
    throw new AppError('Le patient a déjà un rendez-vous confirmé dans un intervalle de 30 minutes', 409);
  }
};

const ensurePatientExists = async (patientId) => {
  const res = await db.query(
    'SELECT 1 FROM patients WHERE id = $1 AND deleted_at IS NULL',
    [patientId]
  );
  if (res.rows.length === 0) throw new AppError('Patient introuvable', 404);
};

const create = async (userId, data) => {
  const { patientId, appointmentDate, status = 'pending', reason, notes } = data;

  await ensurePatientExists(patientId);

  return withPatientLock(patientId, async (client) => {
    if (status === 'confirmed') {
      await checkConflict(client, patientId, appointmentDate);
    }

    const res = await client.query(
      `INSERT INTO appointments (patient_id, appointment_date, status, reason, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, patient_id AS "patientId", appointment_date AS "appointmentDate",
                 status, reason, notes, created_by AS "createdBy"`,
      [patientId, appointmentDate, status, reason, notes, userId]
    );
    return res.rows[0];
  });
};

const getAll = async (date, status, patientId) => {
  let query = `
    SELECT a.id, a.appointment_date AS "appointmentDate", a.status, a.reason, a.notes,
           a.created_by AS "createdBy",
           COALESCE(u.full_name, u.email) AS "createdByName",
           p.full_name AS "patientName", p.id AS "patientId"
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON a.created_by = u.id
    WHERE p.deleted_at IS NULL
  `;
  const params = [];

  if (date) {
    params.push(date);
    query += ` AND a.appointment_date >= $${params.length}::date
               AND a.appointment_date < ($${params.length}::date + 1)`;
  }
  if (status) {
    params.push(status);
    query += ` AND a.status = $${params.length}`;
  }
  if (patientId) {
    params.push(patientId);
    query += ` AND a.patient_id = $${params.length}`;
  }

  query += ` ORDER BY a.appointment_date ASC`;

  const res = await db.query(query, params);
  return res.rows;
};

const updateStatus = async (id, status) => {
  const currentApp = await db.query(
    'SELECT patient_id FROM appointments WHERE id = $1',
    [id]
  );
  if (currentApp.rows.length === 0) throw new AppError('Rendez-vous introuvable', 404);

  const { patient_id } = currentApp.rows[0];

  return withPatientLock(patient_id, async (client) => {
    // Relecture sous verrou : la date ne peut plus changer entre la vérification et l'écriture
    const current = await client.query(
      'SELECT appointment_date FROM appointments WHERE id = $1',
      [id]
    );
    if (current.rows.length === 0) throw new AppError('Rendez-vous introuvable', 404);

    if (status === 'confirmed') {
      await checkConflict(client, patient_id, current.rows[0].appointment_date, id);
    }

    const res = await client.query(
      `UPDATE appointments SET status = $1 WHERE id = $2
       RETURNING id, status, appointment_date AS "appointmentDate"`,
      [status, id]
    );
    return res.rows[0];
  });
};

module.exports = { create, getAll, updateStatus };