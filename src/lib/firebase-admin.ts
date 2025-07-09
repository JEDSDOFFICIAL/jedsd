// lib/firebase-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

let isInitialized = false;

function initializeFirebaseAdmin() {
  if (isInitialized || getApps().length) return;

  const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Validate required environment variables
  if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
    throw new Error("Missing required Firebase admin environment variables");
  }

  initializeApp({
    credential: cert(firebaseAdminConfig as any),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  isInitialized = true;
}

export function getAdminStorage() {
  initializeFirebaseAdmin();
  return getStorage();
}
