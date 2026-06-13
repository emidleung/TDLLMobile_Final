import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ REPLACE THIS with your actual config from the Firebase Console (Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyCDS-9-Tz364yp5NiPRPN8WzeA4TfBRsq4",
  authDomain: "testing-9f148.firebaseapp.com",
  databaseURL: "https://testing-9f148-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testing-9f148",
  storageBucket: "testing-9f148.firebasestorage.app",
  messagingSenderId: "117824824671",
  appId: "1:117824824671:web:755694c0f441530f2442ea",
  measurementId: "G-8BYQF3J162"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so your other files can use them
export const auth = getAuth(app);

// Use initializeFirestore for more robust connectivity settings (handles restricted networks better)
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, // Crucial for "client is offline" fixes in restricted environments
});

export const storage = getStorage(app);
