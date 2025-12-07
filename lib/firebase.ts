// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB8pssETBZdviOtlAo7TplqMVQ4zU5FWUg",
  authDomain: "ecommerce-website-6aa12.firebaseapp.com",
  projectId: "ecommerce-website-6aa12",
  storageBucket: "ecommerce-website-6aa12.firebasestorage.app",
  messagingSenderId: "795427918186",
  appId: "1:795427918186:web:a8370def746fd551b39513",
  measurementId: "G-84QE5E3RVQ"
}

// Initialize Firebase
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

export default app
