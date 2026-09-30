const AppError = require('../utils/AppError');

const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Accès interdit. Permission insuffisante', 403));
    }
    next();
  };
};

module.exports = roleGuard;