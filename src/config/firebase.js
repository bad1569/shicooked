// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2KdojXKpe_jGot76EUgIm2OvDQDEFH-g",
  authDomain: "alacritas-ai.firebaseapp.com",
  databaseURL: "https://alacritas-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "alacritas-ai",
  storageBucket: "alacritas-ai.firebasestorage.app",
  messagingSenderId: "608598039016",
  appId: "1:608598039016:web:37d0badafbac47aa336c5d",
  measurementId: "G-YKBJLJZ04N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);