const appointmentsService = require('./appointments.service');

const createAppointment = async (req, res, next) => {
  try {
    const data = await appointmentsService.create(req.user.id, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const getAppointments = async (req, res, next) => {
  try {
    const { date, status, patientId } = req.query;
    const data = await appointmentsService.getAll(date, status, patientId);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const data = await appointmentsService.updateStatus(req.params.id, status);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

module.exports = { createAppointment, getAppointments, updateStatus };