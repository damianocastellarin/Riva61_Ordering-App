import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, collection, getDocs, getDoc, setDoc, addDoc,
    doc, deleteDoc, query, where, orderBy, enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAe31iCsYnsDKwPYmEbUl6OieIIeAuwBg",
    authDomain: "ordini-bar-a6019.firebaseapp.com",
    projectId: "ordini-bar-a6019",
    storageBucket: "ordini-bar-a6019.firebasestorage.app",
    messagingSenderId: "778714054719",
    appId: "1:778714054719:web:14270825ab908f3dc0f88a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Persistenza fallita: troppe schede aperte.");
    } else if (err.code == 'unimplemented') {
        console.warn("Il browser non supporta la persistenza.");
    }
});

window.fb = {
    auth, db,
    signInWithEmailAndPassword, onAuthStateChanged, signOut,
    collection, getDocs, getDoc, setDoc, addDoc, doc, deleteDoc, query, where, orderBy
};