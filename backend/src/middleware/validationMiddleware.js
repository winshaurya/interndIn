// src/middleware/validationMiddleware.js
const Joi = require("joi");

/**
 * A reusable middleware for validating requests using Joi schemas.
 *
 * @param {Object} schema - Joi schema object containing `body`, `query`, or `params` keys.
 */


// ab- Jab hum API banate hain, toh user jo bhi data bhejta hai (signup form, login form, etc.), wo galat format ka bhi ho sakta hai.
//Example: User ne email ke jagah "abc123" bhej diya ya password ki length sirf 2 characters hai.
//Aise cases ko manually check karna boring aur error-prone hota hai.
//Joi use hota hai automatic data validation ke liye.
//Matlab hum ek schema banate hain (rules define karte hain), aur Joi check karega ki user ke data wo rules follow karte hain ya nahi.

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validationOptions = {
        abortEarly: false, // show all errors, not just the first
        allowUnknown: true, // allow extra fields
        stripUnknown: true, // remove unknown fields
      };

      // Validate request parts
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, validationOptions);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid request body",
            details: error.details.map((d) => d.message),
          });
        }
        req.body = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, validationOptions);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid query parameters",
            details: error.details.map((d) => d.message),
          });
        }
        req.query = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, validationOptions);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid URL params",
            details: error.details.map((d) => d.message),
          });
        }
        req.params = value;
      }

      next();
    } catch (err) {
      console.error("Validation middleware error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
};

module.exports = validate;
