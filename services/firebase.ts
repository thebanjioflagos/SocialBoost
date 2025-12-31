
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Note: In a production environment, these should be populated via environment variables.
// For the purpose of this implementation, we assume a standard Firebase config structure.
const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_KEY_FOR_FIREBASE",
  authDomain: "socialboost-pro.firebaseapp.com",
  projectId: "socialboost-pro",
  storageBucket: "socialboost-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
