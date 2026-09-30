const authService = require('./auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };