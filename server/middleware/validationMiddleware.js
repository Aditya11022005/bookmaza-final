import { validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({ message, errors: errors.array() });
  }
  next();
};

export { validateRequest };
