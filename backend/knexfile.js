const path = require("path");
// load backend/.env by default (fall back to parent .env if needed)
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: process.env.DB_NAME || "alumniPortal",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "aryanagrawal_92",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.resolve(__dirname, "src", "migrations"),
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },

    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.resolve(__dirname, "src", "migrations"),
      tableName: "knex_migrations",
    },
  },
};
