const usersService = require('./users.service');

const getUsers = async (req, res, next) => {
  try {
    res.status(200).json({ status: 'success', data: await usersService.getAll() });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    res.status(201).json({ status: 'success', data: await usersService.create(req.body) });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const data = await usersService.update(req.params.id, req.user.id, req.body);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    await usersService.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };