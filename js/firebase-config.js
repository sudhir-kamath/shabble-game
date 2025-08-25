// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_o8brOfRAyQeh_kkpTaGXu3CvxKy0qAg",
    authDomain: "shabble-f7005.firebaseapp.com",
    projectId: "shabble-f7005",
    storageBucket: "shabble-f7005.firebasestorage.app",
    messagingSenderId: "820609092305",
    appId: "1:820609092305:web:775e2af77817428cddd3f0",
    measurementId: "G-VZ0B699926"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
