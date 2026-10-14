import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "firebase/firestore";

const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain &&
  firebaseConfig.projectId && firebaseConfig.appId
);

let auth, db, googleProvider;
if (firebaseReady) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

export { auth, db, googleProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, getDoc, setDoc, serverTimestamp };

export async function loadProgress(uid) {
  if (!db || !uid) return {};
  const snap = await getDoc(doc(db, "studentProgress", uid));
  return snap.exists() ? (snap.data().progress || {}) : {};
}

export async function saveProgress(uid, progress) {
  if (!db || !uid) return;
  await setDoc(doc(db, "studentProgress", uid), {
    progress,
    updatedAt: serverTimestamp()
  }, { merge: true });
}