const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => {
        
        const field = issue.path.slice(1).join('.');
        return field ? `${field} : ${issue.message}` : issue.message;
      })
      .join(', ');
    return next(new AppError(message, 400));
  }

  
  if (result.data.body) {
    req.body = result.data.body;
  }
  next();
};

module.exports = validate;