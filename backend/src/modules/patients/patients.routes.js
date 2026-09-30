const express = require('express');
const router = express.Router();
const patientsController = require('./patients.controller');
const auth = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const {
  createPatientSchema,
  listPatientsSchema,
  patientIdSchema,
} = require('./patients.schema');

router.use(auth);

router.get('/', validate(listPatientsSchema), patientsController.getPatients);
router.get('/:id', validate(patientIdSchema), patientsController.getPatient);
router.post('/', validate(createPatientSchema), patientsController.createPatient);
router.put(
  '/:id',
  validate(patientIdSchema),
  validate(createPatientSchema),
  patientsController.updatePatient
);
router.delete(
  '/:id',
  roleGuard(['admin']),
  validate(patientIdSchema),
  patientsController.deletePatient
);

module.exports = router;