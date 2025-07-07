// firebase.js

// Import Firebase core and needed services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhLuIhRH619e6aVMxSsojSjq-3MeSkoMI",
  authDomain: "campus-connect-3b8bb.firebaseapp.com",
  projectId: "campus-connect-3b8bb",
  storageBucket: "campus-connect-3b8bb.appspot.com", // ✅ Corrected
  messagingSenderId: "544560691160",
  appId: "1:544560691160:web:f8158346d3b6a70f8ca4ad",
  measurementId: "G-8HPVC6B95Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export for use in other files like auth.js
export { app, auth, db, analytics };
