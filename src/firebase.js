import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage
import { INITIAL_USERS } from "./constants";

const firebaseConfig = {
  apiKey: "AIzaSyBomNFXi3l1rJi7N69eu3Udo_ThseZAxag",
  authDomain: "rbacs-64dd0.firebaseapp.com",
  projectId: "rbacs-64dd0",
  storageBucket: "rbacs-64dd0.appspot.com", // Storage bucket is already in the config
  messagingSenderId: "1058699174583",
  appId: "1:1058699174583:web:5b2d785e2af226ad482332",
  measurementId: "G-5J9K6F2HM5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Initialize Super Admin and Admin
const initializeUsers = async () => {
  for (const user of INITIAL_USERS) {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const firebaseUser = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: user.email,
        role: user.role,
      });

      console.log(`${user.role} initialized successfully.`);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`${user.role} already exists.`);
      } else {
        console.error(`Error initializing ${user.role}:`, error);
      }
    }
  }
};

initializeUsers(); // Call the function to initialize users

export { auth, db, storage,app }; // Export storage alongside auth and db
