import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Default Firebase Client Config
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "optimal-method-9vk22",
  appId: "1:427564321799:web:3048ff17a460bb8de06ea2",
  apiKey: "AIzaSyCVDbBruuloGSWawKzOLCesljFQ8y8Bgxw",
  authDomain: "optimal-method-9vk22.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-goldenmonstateki-59e0f912-b1fd-4580-b388-c29d6fd2ae07",
  storageBucket: "optimal-method-9vk22.firebasestorage.app",
  messagingSenderId: "427564321799",
};

// Support environment variables, JSON config, and constant fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig?.appId || DEFAULT_FIREBASE_CONFIG.appId,
};

const databaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  appletConfig?.firestoreDatabaseId ||
  DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId;

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

console.log('🔥 [Firebase Live Real-Time Config]', {
  projectId: firebaseConfig.projectId,
  databaseId,
  hasFirebaseConfig,
});

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Specify firestoreDatabaseId to ensure live real-time sync with AI Studio Firestore
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Initial connection verification
export async function testFirestoreConnection() {
  if (!hasFirebaseConfig) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting.');
    }
  }
}
testFirestoreConnection();
