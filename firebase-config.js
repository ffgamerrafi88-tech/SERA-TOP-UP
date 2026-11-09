// Firebase Configuration & Initialization
const firebaseConfig = {
    apiKey: "AIzaSyAcGK0qUTeYvBMcxR3pL2IVaq34KXIuuUk",
    authDomain: "sera-top-up-a2d73.firebaseapp.com",
    projectId: "sera-top-up-a2d73",
    storageBucket: "sera-top-up-a2d73.firebasestorage.app",
    messagingSenderId: "900869739046",
    appId: "1:900869739046:web:651ee2f9b1c7c18c71cce7",
    measurementId: "G-R3YH2YF39H"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
