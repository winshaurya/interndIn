const Joi = require('joi');

const postJobSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  location: Joi.string().optional(),
  salary_range: Joi.string().optional(),
  type: Joi.string().valid('full-time', 'part-time', 'internship', 'contract').optional(),
  mode: Joi.string().valid('remote', 'on-site', 'hybrid').optional(),
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).optional(),
  location: Joi.string().optional(),
  salary_range: Joi.string().optional(),
  type: Joi.string().valid('full-time', 'part-time', 'internship', 'contract').optional(),
  mode: Joi.string().valid('remote', 'on-site', 'hybrid').optional(),
  job_type: Joi.string().valid('full-time', 'part-time', 'internship', 'contract').optional(),
  work_mode: Joi.string().valid('remote', 'on-site', 'hybrid').optional(),
  status: Joi.alternatives().try(
    Joi.string().valid('active', 'inactive'),
    Joi.boolean()
  ).optional(),
}).or('title', 'description', 'location', 'salary_range', 'type', 'mode', 'job_type', 'work_mode', 'status');

module.exports = {
  postJobSchema,
  updateJobSchema,
};
