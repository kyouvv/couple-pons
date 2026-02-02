// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiazmMCbv0lX-_YzNAFZ-3PpahMj1LDJk",
  authDomain: "coupons-app-a5e6a.firebaseapp.com",
  projectId: "coupons-app-a5e6a",
  storageBucket: "coupons-app-a5e6a.firebasestorage.app",
  messagingSenderId: "836676055349",
  appId: "1:836676055349:web:d7a71d61dbb973a111dc7c",
  measurementId: "G-TC62M0FW6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);