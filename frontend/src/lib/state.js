// Lightweight client-side state manager with localStorage persistence
const USER_KEY = 'interndin_user_v1';

const subscribers = new Set();

const getStored = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read stored user', e);
    return null;
  }
};

const setStored = (value) => {
  try {
    if (!value) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(value));
    }
    subscribers.forEach((s) => s(value));
  } catch (e) {
    console.warn('Failed to persist user', e);
  }
};

export const loadUser = () => getStored();
export const saveUser = (u) => setStored(u);
export const clearUser = () => setStored(null);

export const subscribeUser = (fn) => {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};

export default {
  loadUser,
  saveUser,
  clearUser,
  subscribeUser,
};
