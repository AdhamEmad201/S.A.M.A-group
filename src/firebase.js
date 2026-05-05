import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB1epayGRXXWJ6D_EmAwmoWdABnVVG2jFY",
  authDomain: "sama-group-d7f59.firebaseapp.com",
  projectId: "sama-group-d7f59",
  storageBucket: "sama-group-d7f59.firebasestorage.app",
  messagingSenderId: "772889770982",
  appId: "1:772889770982:web:89cc3ea440e6533f43f427",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
