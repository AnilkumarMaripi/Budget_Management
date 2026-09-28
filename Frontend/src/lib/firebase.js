import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjS-8xSywEntEh-3jd-vQL3fCYgWHHBY0",
  authDomain: "budgetmanagement-ba9b6.firebaseapp.com",
  projectId: "budgetmanagement-ba9b6",
  storageBucket: "budgetmanagement-ba9b6.firebasestorage.app",
  messagingSenderId: "401567869642",
  appId: "1:401567869642:web:8b2721609f9cc2a3456233",
  measurementId: "G-SY0H18VJHK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (supported in browser environments)
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {});

/**
 * Sign in with Google Popup via Firebase
 */
export async function signInWithFirebaseGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        onboardingComplete: false
      }
    };
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    return {
      success: false,
      error: error.message || "Failed to sign in with Google"
    };
  }
}

/**
 * Sign in with Email and Password via Firebase
 */
export async function signInWithFirebaseEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        onboardingComplete: false
      }
    };
  } catch (error) {
    console.error("Firebase Email Auth Error:", error);
    return {
      success: false,
      error: error.message || "Invalid credentials"
    };
  }
}

/**
 * Register with Email and Password via Firebase
 */
export async function registerWithFirebaseEmail(email, password, name = '') {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (name) {
      await updateProfile(user, { displayName: name });
    }
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: name || user.email.split('@')[0],
        onboardingComplete: false
      }
    };
  } catch (error) {
    console.error("Firebase Registration Error:", error);
    return {
      success: false,
      error: error.message || "Failed to create account"
    };
  }
}

/**
 * Firebase Sign Out
 */
export async function firebaseSignOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export { app, auth, analytics, googleProvider };
