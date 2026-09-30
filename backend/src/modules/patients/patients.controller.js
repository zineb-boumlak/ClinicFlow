const patientsService = require('./patients.service');

const getPatients = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const data = await patientsService.getAll(search, page, limit);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const getPatient = async (req, res, next) => {
  try {
    const data = await patientsService.getById(req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const createPatient = async (req, res, next) => {
  try {
    const data = await patientsService.create(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const updatePatient = async (req, res, next) => {
  try {
    const data = await patientsService.update(req.params.id, req.body);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const deletePatient = async (req, res, next) => {
  try {
    await patientsService.deletePatient(req.params.id);
    res.status(200).json({ status: 'success', message: 'Patient supprimé avec succès' });
  } catch (err) { next(err); }
};

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient };