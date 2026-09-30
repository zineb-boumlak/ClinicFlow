const db = require('../../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Début du Seeding...');
    await db.query('TRUNCATE appointments, patients, users RESTART IDENTITY CASCADE');

    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await db.query(
      `INSERT INTO users (email, password, role) VALUES ('admin@clinic.com', $1, 'admin') RETURNING id`,
      [passwordHash]
    );
    const staff1 = await db.query(
      `INSERT INTO users (email, password, role) VALUES ('staff1@clinic.com', $1, 'staff') RETURNING id`,
      [passwordHash]
    );
    await db.query(`INSERT INTO users (email, password, role) VALUES ('staff2@clinic.com', $1, 'staff')`, [passwordHash]);

    const adminId = admin.rows[0].id;

    const p1 = await db.query(`INSERT INTO patients (full_name, cin, phone, birth_date) VALUES ('Karim Tazi', 'AB123456', '0661234567', '1990-05-15') RETURNING id`);
    const p2 = await db.query(`INSERT INTO patients (full_name, cin, phone, birth_date) VALUES ('Sanae Bennani', 'CD789012', '0662345678', '1985-11-20') RETURNING id`);
    const p3 = await db.query(`INSERT INTO patients (full_name, cin, phone, birth_date) VALUES ('Youssef El Amrani', 'EF345678', '0663456789', '2000-01-10') RETURNING id`);
    const p4 = await db.query(`INSERT INTO patients (full_name, cin, phone, birth_date) VALUES ('Fatima Zahra', 'GH901234', '0664567890', '1995-08-30') RETURNING id`);
    const p5 = await db.query(`INSERT INTO patients (full_name, cin, phone, birth_date) VALUES ('Omar Naciri', 'IJ567890', '0665678901', '1978-03-25') RETURNING id`);

    const patients = [p1.rows[0].id, p2.rows[0].id, p3.rows[0].id, p4.rows[0].id, p5.rows[0].id];
    const statuses = ['pending', 'confirmed', 'cancelled'];

    for (let i = 0; i < 10; i++) {
      const pId = patients[i % patients.length];
      const status = statuses[i % statuses.length];
      const date = new Date(Date.now() + i * 86400000).toISOString();
      await db.query(
        `INSERT INTO appointments (patient_id, appointment_date, status, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [pId, date, status, `Consultation générale ${i + 1}`, adminId]
      );
    }

    console.log('Seeding terminé avec succès!');
    process.exit(0);
  } catch (err) {
    console.error('Erreur Seeding:', err);
    process.exit(1);
  }
}

seed();