import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDs3qYWQsGoOZzPIgpy9yEj25gnRDE3PlQ",
  authDomain: "veloverse-v0001.firebaseapp.com",
  projectId: "veloverse-v0001",
  storageBucket: "veloverse-v0001.firebasestorage.app",
  messagingSenderId: "822912795327",
  appId: "1:822912795327:web:18c8e8702029ed92ca7c0a",
  measurementId: "G-812L56QHYV"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
