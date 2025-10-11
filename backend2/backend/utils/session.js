// session.js
// Simple in-memory session tracking for SMS/IVR farmers

const sessions = new Map();

/**
 * Start or update a session
 * @param {string} phone - Farmer phone number
 * @param {object} data - Data to store
 */
function setSession(phone, data) {
  sessions.set(phone, { ...sessions.get(phone), ...data });
}

/**
 * Get the current session data for a farmer
 * @param {string} phone - Farmer phone number
 */
function getSession(phone) {
  return sessions.get(phone) || {};
}

/**
 * Clear a session (after submission)
 * @param {string} phone - Farmer phone number
 */
function clearSession(phone) {
  sessions.delete(phone);
}

module.exports = {
  setSession,
  getSession,
  clearSession
};
