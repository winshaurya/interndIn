// src/services/tokenService.js
const crypto = require('crypto');

const DEFAULT_SIZE = 32; // bytes

// returns plain token (hex)
function generateRandomToken(size = DEFAULT_SIZE) {
  return crypto.randomBytes(size).toString('hex'); // 64 chars for 32 bytes
}

// hash plain token (sha256 hex)
function hashToken(plainToken) {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
}

// timing-safe compare
function verifyTokenHash(plainToken, storedHash) {
  const hashed = hashToken(plainToken);
  // lengths must match
  if (!hashed || !storedHash || hashed.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(storedHash));
}

module.exports = {
  generateRandomToken,
  hashToken,
  verifyTokenHash
};

//use for hashing and verifying crypto