import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAmf6WmzdjLB6ehOIiei1fTRC-KPv7dn-g",
    authDomain: "shoppingcart-9e808.firebaseapp.com",
    databaseURL: "https://shoppingcart-9e808.firebaseio.com",
    projectId: "shoppingcart-9e808",
    storageBucket: "shoppingcart-9e808.appspot.com",
    messagingSenderId: "285196399883",
    appId: "1:285196399883:web:c36eb63d97f0ce28819e0e",
    measurementId: "G-0NJY4VB59S"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database().ref();

  export default db;