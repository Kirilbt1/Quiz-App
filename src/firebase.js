import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCR-ItSYtcSw_7xpjxdrKohQlKuZURTrRw",
    authDomain: "quiz-fc556.firebaseapp.com",
    projectId: "quiz-fc556",
    storageBucket: "quiz-fc556.appspot.com",
    messagingSenderId: "896306927324",
    appId: "1:896306927324:web:9e1e111ab06b53d4e00619",
    measurementId: "G-ZHRG2BD2YS"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };