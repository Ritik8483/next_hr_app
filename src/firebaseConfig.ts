import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDi3xf_XuVjrs7x4ZvGW4NJptbcPcnMinQ",
  authDomain: "ql-feedback-app.firebaseapp.com",
  projectId: "ql-feedback-app",
  storageBucket: "ql-feedback-app.appspot.com",
  messagingSenderId: "610459645606",
  appId: "1:610459645606:web:152381956e73c8f369a667",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
