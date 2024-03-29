import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAqY8Gk6soovRIgfTzethuW4m0wRWs9Y6Y",
  authDomain: "pfe-unirent.firebaseapp.com",
  projectId: "pfe-unirent",
  storageBucket: "pfe-unirent.appspot.com",
  messagingSenderId: "204059485218",
  appId: "1:204059485218:web:fcdaa41c527747778ad67b",
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
const storage = getStorage(app);

export { app, firestore, auth, storage};
