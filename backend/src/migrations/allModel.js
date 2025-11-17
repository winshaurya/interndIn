// db/migrations/20250918060958_create_alumni_schema.js

exports.up = function (knex) {
  // Ensure pgcrypto is available for gen_random_uuid()
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";').then(() => {
    return knex.schema
      .createTable("users", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("email", 255).notNullable().unique();
      table.text("password_hash").notNullable();
      table.string("role", 20).notNullable();
      table.boolean("is_verified").defaultTo(false);
      table.string("status", 20);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("student_profiles", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("name", 255).notNullable();
      table.string("student_id", 50).notNullable();
      table.string("branch", 100).notNullable();
      table.integer("grad_year").notNullable(); // Made not nullable as requested
      table.text("skills");
      table.text("resume_url");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("alumni_profiles", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("name", 255).notNullable();
      table.integer("grad_year");
      table.string("current_title", 255);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("companies", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("alumni_id")
        .notNullable()
        .references("id")
        .inTable("alumni_profiles")
        .onDelete("CASCADE");
      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("name", 140);
      table.text("website");
      table.string("industry", 100);
      table.string("company_size", 50);
      table.text("about");
      table.text("document_url");
      table.string("status", 20);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("jobs", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("company_id")
        .notNullable()
        .references("id")
        .inTable("companies")
        .onDelete("CASCADE");
      // allow null so ON DELETE SET NULL works as expected
      table
        .uuid("posted_by_alumni_id")
        .nullable()
        .references("id")
        .inTable("alumni_profiles")
        .onDelete("SET NULL");
      table.string("job_title", 255).notNullable();
      table.text("job_description");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("job_applications", (table) => {
      table
        .uuid("job_id")
        .notNullable()
        .references("id")
        .inTable("jobs")
        .onDelete("CASCADE");
      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.text("resume_url");
      table.integer("applicant_count").defaultTo(0);
      table.timestamp("applied_at").defaultTo(knex.fn.now());
      table.primary(["job_id", "user_id"]);
    })
    .createTable("otp_verifications", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("email", 255).notNullable();
      table.string("otp", 6).notNullable();
      table.timestamp("expires_at").notNullable();
      table.boolean("is_used").defaultTo(false);
    })
    .createTable("password_reset_tokens", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("token_hash", 255).notNullable();
      table.timestamp("expires_at").notNullable();
      table.boolean("used").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("notifications", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");

      table.string("title", 120).notNullable();
      table.text("message").notNullable();
      table.boolean("is_read").notNullable().defaultTo(false);
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    });
  });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("job_applications")
    .dropTableIfExists("jobs")
    .dropTableIfExists("companies")
    .dropTableIfExists("notifications")
    .dropTableIfExists("password_reset_tokens")
    .dropTableIfExists("alumni_profiles")
    .dropTableIfExists("student_profiles")
    .dropTableIfExists("otp_verifications")
    .dropTableIfExists("users")
    .then(() => knex.raw('DROP EXTENSION IF EXISTS "pgcrypto"'));
};
