// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb6J7ksrFIJZMgeIvrkuQ_hzfOdrehgT4",
  authDomain: "expenser-2335.firebaseapp.com",
  projectId: "expenser-2335",
  storageBucket: "expenser-2335.firebasestorage.app",
  messagingSenderId: "829602228195",
  appId: "1:829602228195:web:851194b850a6be96ee62d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);