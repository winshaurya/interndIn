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

if (!supabaseUrl) {
  console.warn(
    '⚠️  Missing SUPABASE_URL environment variable. Supabase client will be unavailable.\n' +
      'Set SUPABASE_URL in backend/.env to enable database and storage features.'
  );
}

if (!serviceRoleKey) {
  console.warn(
    '⚠️  Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Admin operations will be disabled.\n' +
      'Set SUPABASE_SERVICE_ROLE_KEY in backend/.env to enable admin features.'
  );
}

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

const createAdminClient = () => createClient(supabaseUrl, serviceRoleKey, mergeOptions());
const createAnonClient = () => (anonKey ? createClient(supabaseUrl, anonKey, mergeOptions()) : null);

const adminClient = supabaseUrl && serviceRoleKey ? createAdminClient() : null;
const anonClient = supabaseUrl && anonKey ? createAnonClient() : null;

// indicate whether a service role key is available (useful guards elsewhere)
const hasServiceRoleKey = Boolean(serviceRoleKey);

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
  from: (...args) => {
    if (!adminClient) throw new Error('Supabase admin client not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)');
    return adminClient.from(...args);
  },
  rpc: (...args) => {
    if (!adminClient) throw new Error('Supabase admin client not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)');
    return adminClient.rpc(...args);
  },
  storage: adminClient ? adminClient.storage : {
    from: () => ({
      upload: async () => { throw new Error('Supabase storage not configured'); },
      getPublicUrl: () => ({ publicUrl: '' }),
      remove: async () => { throw new Error('Supabase storage not configured'); },
    })
  },
  auth: anonClient ? anonClient.auth : {
    signUp: async () => { throw new Error('Supabase auth not configured'); },
    signInWithPassword: async () => { throw new Error('Supabase auth not configured'); },
    signOut: async () => { throw new Error('Supabase auth not configured'); },
    getUser: async () => { throw new Error('Supabase auth not configured'); },
    getSession: async () => { throw new Error('Supabase auth not configured'); },
    admin: adminClient ? adminClient.auth.admin : { deleteUser: async () => { throw new Error('Supabase admin not configured'); } }
  },
  channel: (...args) => {
    if (!adminClient) throw new Error('Supabase admin client not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)');
    return adminClient.channel(...args);
  },
  supabase: adminClient,

  getServiceClient: () => adminClient,
  getPublicClient: () => anonClient,
  getSessionClient: (accessToken, overrides) => createSessionClient(accessToken, overrides),

  withServiceRole: async (handler) => {
    if (!adminClient) throw new Error('Supabase admin client not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)');
    return handler(adminClient);
  },
  withRlsSession: (accessToken, handler) => withClient(() => createSessionClient(accessToken), handler),

  // Expose helper flag so other modules can check availability
  hasServiceRoleKey,

  ensureSuccess: async (promise, context) => {
    const { data, error, ...rest } = await promise;
    if (error) {
      throw enhanceError(error, context);
    }
    return { data, ...rest };
  },
};

module.exports = db;
