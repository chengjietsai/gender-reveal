import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBl2s1tk8ssfJRuR7RU8fABJTURA0YMcLg",
    authDomain: "cj-gender-reveal-party.firebaseapp.com",
    projectId: "cj-gender-reveal-party",
    storageBucket: "cj-gender-reveal-party.firebasestorage.app",
    messagingSenderId: "1074352932756",
    appId: "1:1074352932756:web:0be1a20c4271813c7df181",
    measurementId: "G-XZ1YPN88NE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);