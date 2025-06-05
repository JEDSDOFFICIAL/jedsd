// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyActDOhlBZV_R7yTI089WvZoIg1ZHwkYTo",
  authDomain: "jedsd-20db2.firebaseapp.com",
  projectId: "jedsd-20db2",
  storageBucket: "jedsd-20db2.firebasestorage.app",
  messagingSenderId: "614938840446",
  appId: "1:614938840446:web:f90f9ce698b129256bf72f",
  measurementId: "G-LF3T6DR9JB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default storage;