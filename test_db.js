import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const users = await getDocs(collection(db, "users"));
  console.log("Users:", users.docs.map(d => ({id: d.id, fullName: d.data().fullName})));

  const conns = await getDocs(collection(db, "connections"));
  console.log("Connections:", conns.docs.map(d => ({id: d.id, employerID: d.data().employerID, helperID: d.data().helperID})));

  const tasks = await getDocs(collection(db, "tasks"));
  console.log("Tasks:", tasks.docs.map(d => ({id: d.id, employer: d.data().employerID, helper: d.data().helperID})));

  const chats = await getDocs(collection(db, "chats"));
  console.log("Chats count:", chats.docs.length);

  for (let chatDoc of chats.docs) {
      await deleteDoc(doc(db, "chats", chatDoc.id));
  }
  for (let taskDoc of tasks.docs) {
      await deleteDoc(doc(db, "tasks", taskDoc.id));
  }
  // Delete all connections except conn-real? Let's just delete all and re-seed?
  // Wait, no, the user might have their own connection. I'll just keep the valid ones.
  for (let connDoc of conns.docs) {
      const data = connDoc.data();
      if ((data.employerID !== '66924319' && data.employerID !== '13345678') || (data.helperID !== '66924319' && data.helperID !== '13345678')) {
          await deleteDoc(doc(db, "connections", connDoc.id));
          console.log("Deleted invalid connection:", connDoc.id);
      }
  }
  
  process.exit(0);
}

run();
