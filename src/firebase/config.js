// src/firebase/config.js — your Firebase web app settings (from Firebase Console → Project settings → Your apps → Web app).
// These values are PUBLIC by design (every website using Firebase shows them). Your data is protected by the
// security rules in firestore.rules, not by hiding this. Never put passwords or secret keys in this project.
export const firebaseConfig = {
  apiKey: 'AIzaSyAgc2aYWecgcBJmOYwvJGY62ZBjj2t9s4Y',
  authDomain: 'inviname-b7b7d.firebaseapp.com',
  projectId: 'inviname-b7b7d',
  storageBucket: 'inviname-b7b7d.firebasestorage.app',
  messagingSenderId: '1041474729770',
  appId: '1:1041474729770:web:f161a4ee77b1ac72f69053',
}

// Until the values above are filled in, the site keeps working with the sample products (and login is off).
export const isConfigured = !Object.values(firebaseConfig).some((v) => String(v).includes('PASTE_'))
