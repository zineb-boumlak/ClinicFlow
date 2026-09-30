const db = require('../../config/db');
const AppError = require('../../utils/AppError');


const PATIENT_COLUMNS = `
  id,
  full_name AS "fullName",
  cin,
  phone,
  to_char(birth_date, 'YYYY-MM-DD') AS "birthDate",
  address,
  created_at AS "createdAt"
`;


const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');


const rethrowDuplicateCin = (err) => {
  if (err.code === '23505') {
    throw new AppError('Un patient existe déjà avec ce CIN', 409);
  }
  throw err;
};

const getAll = async (search = '', page = 1, limit = 10) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (pageNum - 1) * limitNum;
  const pattern = `%${escapeLike(String(search).trim())}%`;

  const where = '(full_name ILIKE $1 OR cin ILIKE $1) AND deleted_at IS NULL';

  const [countRes, listRes] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM patients WHERE ${where}`, [pattern]),
    db.query(
      `SELECT ${PATIENT_COLUMNS}
       FROM patients
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [pattern, limitNum, offset]
    ),
  ]);

  const total = parseInt(countRes.rows[0].count, 10);

  return {
    patients: listRes.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getById = async (id) => {
  const patientRes = await db.query(
    `SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  if (patientRes.rows.length === 0) throw new AppError('Patient introuvable', 404);

  const appointmentsRes = await db.query(
    `SELECT id, appointment_date AS "appointmentDate", status, reason, notes, created_at AS "createdAt"
     FROM appointments WHERE patient_id = $1 ORDER BY appointment_date DESC`,
    [id]
  );

  return { ...patientRes.rows[0], appointments: appointmentsRes.rows };
};

const create = async (data) => {
  const { fullName, cin, phone, birthDate, address } = data;

  try {
    const res = await db.query(
      `INSERT INTO patients (full_name, cin, phone, birth_date, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PATIENT_COLUMNS}`,
      [fullName, cin, phone, birthDate, address || null]
    );
    return res.rows[0];
  } catch (err) {
    return rethrowDuplicateCin(err);
  }
};

const update = async (id, data) => {
  const { fullName, cin, phone, birthDate, address } = data;

  try {
    const res = await db.query(
      `UPDATE patients
       SET full_name = $1, cin = $2, phone = $3, birth_date = $4, address = $5
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING ${PATIENT_COLUMNS}`,
      [fullName, cin, phone, birthDate, address || null, id]
    );
    if (res.rows.length === 0) throw new AppError('Patient introuvable', 404);
    return res.rows[0];
  } catch (err) {
    return rethrowDuplicateCin(err);
  }
};

const deletePatient = async (id) => {
  const res = await db.query(
    'UPDATE patients SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  if (res.rows.length === 0) throw new AppError('Patient introuvable', 404);
  return true;
};

module.exports = { getAll, getById, create, update, deletePatient };