const express = require('express');
const router = express.Router();
const appointmentsController = require('./appointments.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const {
  createAppointmentSchema,
  listAppointmentsSchema,
  updateStatusSchema,
} = require('./appointments.schema');

router.use(auth);

router.post('/', validate(createAppointmentSchema), appointmentsController.createAppointment);
router.get('/', validate(listAppointmentsSchema), appointmentsController.getAppointments);
router.patch('/:id/status', validate(updateStatusSchema), appointmentsController.updateStatus);

module.exports = router;