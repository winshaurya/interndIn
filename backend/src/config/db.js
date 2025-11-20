const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const { version: appVersion = "unknown" } = require("../../package.json");

const invariant = (value, message) => {
  if (!value) {
    throw new Error(message);
  }
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

invariant(supabaseUrl, "Missing SUPABASE_URL environment variable");
invariant(
  serviceRoleKey,
  "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. The service role key is required for backend database and auth administration."
);

const defaultHeaders = {
  "X-Client-Info": `interndin-backend/${appVersion}`,
};

const baseOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: defaultHeaders,
  },
};

const mergeOptions = (overrides = {}) => ({
  ...baseOptions,
  ...overrides,
  auth: {
    ...baseOptions.auth,
    ...(overrides.auth || {}),
  },
  global: {
    ...baseOptions.global,
    ...(overrides.global || {}),
    headers: {
      ...baseOptions.global.headers,
      ...(overrides.global?.headers || {}),
    },
  },
});

const createAdminClient = () =>
  createClient(supabaseUrl, serviceRoleKey, mergeOptions());
const createAnonClient = () =>
  anonKey ? createClient(supabaseUrl, anonKey, mergeOptions()) : null;

const adminClient = createAdminClient();
const anonClient = createAnonClient();

const enhanceError = (error, context) => {
  if (!error) return error;
  const enhanced = new Error(error.message || "Supabase operation failed");
  enhanced.code = error.code;
  enhanced.hint = error.hint;
  enhanced.details = error.details;
  enhanced.context = context;
  return enhanced;
};

const createSessionClient = (accessToken, overrides = {}) => {
  const key = anonKey || serviceRoleKey;
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {};
  return createClient(
    supabaseUrl,
    key,
    mergeOptions({
      ...overrides,
      global: {
        ...(overrides.global || {}),
        headers: {
          ...(overrides.global?.headers || {}),
          ...headers,
        },
      },
    })
  );
};

const withClient = async (clientFactory, handler) => {
  const client = clientFactory();
  try {
    return await handler(client);
  } catch (error) {
    throw error;
  } finally {
    try {
      await client.removeAllChannels();
    } catch {
      /* noop */
    }
  }
};

const db = {
  from: (...args) => adminClient.from(...args),
  rpc: (...args) => adminClient.rpc(...args),
  storage: adminClient.storage,
  auth: adminClient.auth,
  channel: (...args) => adminClient.channel(...args),
  supabase: adminClient,

  getServiceClient: () => adminClient,
  getPublicClient: () => anonClient,
  getSessionClient: (accessToken, overrides) =>
    createSessionClient(accessToken, overrides),

  withServiceRole: async (handler) => handler(adminClient),
  withRlsSession: (accessToken, handler) =>
    withClient(() => createSessionClient(accessToken), handler),

  ensureSuccess: async (promise, context) => {
    const { data, error, ...rest } = await promise;
    if (error) {
      throw enhanceError(error, context);
    }
    return { data, ...rest };
  },
};

module.exports = db;
