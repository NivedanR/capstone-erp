const Joi = require('joi');
const { ROLES } = require('../config/constants');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

exports.register = validate(Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match'
    }),
    role: Joi.string().valid(...Object.values(ROLES))
  }));
  

exports.login = validate(Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
}));
