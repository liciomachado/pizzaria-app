// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD0s0780K5nWInbwbYCvoIX7kFU6W9mks0",
    authDomain: "gopizza-c742b.firebaseapp.com",
    projectId: "gopizza-c742b",
    storageBucket: "gopizza-c742b.appspot.com",
    messagingSenderId: "673869190883",
    appId: "1:673869190883:web:55cc5928a8c01a8ab517d6",
    measurementId: "G-9LJGERGM53"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig)
} else {
    app = firebase.app();
}

export { firebase };
