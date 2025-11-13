// src/config/db.js
const knex = require("knex");
const knexfile = require("../../knexfile");

const environment = process.env.NODE_ENV || "development";
const db = knex(knexfile[environment]);

db.raw("SELECT 1")
  .then(() => console.log("Connected to PostgreSQL via Knex"))
  .catch((err) => console.error("DB connection error:", err));

module.exports = db;
