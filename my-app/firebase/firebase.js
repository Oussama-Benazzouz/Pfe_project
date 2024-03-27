import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgWD9TcWONMz3M-OJsfPR5IGwP9wxJda8",
  authDomain: "react-native-pfe.firebaseapp.com",
  projectId: "react-native-pfe",
  storageBucket: "react-native-pfe.appspot.com",
  messagingSenderId: "1741496986",
  appId: "1:1741496986:web:80063e4d33ce70a7b07523",
};

const initializeFirebase = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

const app = initializeFirebase();
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
