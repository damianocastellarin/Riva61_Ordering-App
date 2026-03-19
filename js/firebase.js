import { firebaseConfig } from './constants.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, collection, getDocs, getDoc, setDoc, addDoc,
    doc, deleteDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

window.fb = {
    auth, db,
    signInWithEmailAndPassword, onAuthStateChanged, signOut,
    collection, getDocs, getDoc, setDoc, addDoc, doc, deleteDoc, query, where, orderBy
};