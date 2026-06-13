import { db } from './firebase';
import { doc, writeBatch } from 'firebase/firestore';

const initialUsers = [
  { userID: 'employer-1', role: 'employer', fullName: 'Trial User', email: 'employer@mock.com', languagePreference: 'en', createTime: new Date().toISOString() },
  { userID: 'helper-1', role: 'helper', fullName: 'Maria', email: 'helper@mock.com', languagePreference: 'en', createTime: new Date().toISOString() },
  { userID: '66924319', role: 'employer', fullName: 'Trial User', email: 'hello@example.com', languagePreference: 'en', createTime: new Date().toISOString() }
];

const familyMembers = [
  { memberID: 'fm-1', userName: 'Arthur (Hubby)', disease: 'Diabetes', allergy: 'Peanuts', tastePreference: 'light' },
  { memberID: 'fm-2', userName: 'Grandma', disease: 'Hypertension', allergy: 'None', tastePreference: 'light' }
];

const initialConnections = [
  { connectionID: 'conn-1', employerID: 'employer-1', helperID: 'helper-1', createTime: new Date().toISOString() }
];

export const seedDatabase = async () => {
  console.log('Starting Firestore seeding...');
  const batch = writeBatch(db);

  // Seed Users
  for (const user of initialUsers) {
    const userRef = doc(db, 'users', user.userID);
    batch.set(userRef, user);
  }

  // Seed Family Members
  for (const fm of familyMembers) {
    const fmRef = doc(db, 'family-members', fm.memberID);
    batch.set(fmRef, fm);
  }

  // Seed Connections
  for (const conn of initialConnections) {
    const connRef = doc(db, 'connections', conn.connectionID);
    batch.set(connRef, conn);
  }

  try {
    await batch.commit();
    console.log('✅ Firestore seeded successfully!');
  } catch (error) {
    console.error('❌ Firestore seeding failed:', error);
  }
};
