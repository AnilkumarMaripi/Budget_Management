/**
 * Auth library for Smart Budget Planner
 * Uses localStorage for persistent storage ("sb_users", "sb_session")
 * and sessionStorage for non-persistent sessions.
 */

const USERS_KEY = 'sb_users';
const SESSION_KEY = 'sb_session';

/**
 * Get stored users from localStorage
 */
export function getUsers() {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (e) {
    console.error('Failed to parse sb_users:', e);
    return [];
  }
}

/**
 * Save users array to localStorage
 */
export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save sb_users:', e);
  }
}

/**
 * Check if any account exists on this device
 */
export function hasAnyAccount() {
  const users = getUsers();
  return users.length > 0;
}

/**
 * Get active session from localStorage or sessionStorage
 */
export function getSession() {
  try {
    const persistent = localStorage.getItem(SESSION_KEY);
    if (persistent) return JSON.parse(persistent);

    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session);

    return null;
  } catch (e) {
    console.error('Failed to get sb_session:', e);
    return null;
  }
}

/**
 * Save active session
 * @param {Object} user User object
 * @param {boolean} rememberMe Keep session in localStorage or sessionStorage
 */
export function saveSession(user, rememberMe = true) {
  const sessionData = {
    email: user.email,
    name: user.name || user.email.split('@')[0],
    loggedInAt: new Date().toISOString(),
    onboardingComplete: !!user.onboardingComplete
  };

  try {
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

/**
 * Clear session (logout)
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || '');
}

/**
 * Attempt user login
 * Returns { success: boolean, error?: string, user?: Object }
 */
export function loginUser(email, password, rememberMe = true) {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'Enter a valid email' };
  }

  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  const users = getUsers();
  
  if (users.length === 0) {
    return { success: false, error: 'No account found. Create one now' };
  }

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'No account found. Create one now' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Incorrect email or password' };
  }

  saveSession(user, rememberMe);
  return { success: true, user };
}

/**
 * Register a new user
 */
export function registerUser(email, password, name = '') {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'Enter a valid email' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const newUser = {
    id: 'user_' + Date.now(),
    email: cleanEmail,
    password,
    name: name || cleanEmail.split('@')[0],
    onboardingComplete: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  saveSession(newUser, true);

  return { success: true, user: newUser };
}
