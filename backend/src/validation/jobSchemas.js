const Joi = require('joi');

const postJobSchema = Joi.object({
  job_title: Joi.string().min(3).max(200).required(),
  job_description: Joi.string().min(10).required(),
});

const updateJobSchema = Joi.object({
  job_title: Joi.string().min(3).max(200).optional(),
  job_description: Joi.string().min(10).optional(),
}).or('job_title', 'job_description');

module.exports = {
  postJobSchema,
  updateJobSchema,
};
