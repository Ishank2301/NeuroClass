import exampleConfig from '../../firebase-applet-config.example.json';

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

// Loads from environment variables with fallback to example config template
export const firebaseConfig: FirebaseConfig = {
  projectId:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_PROJECT_ID) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID) as string) ||
    exampleConfig.projectId ||
    'woven-bee-hghtt',
  appId:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_APP_ID) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_APP_ID) as string) ||
    exampleConfig.appId ||
    '1:931598103766:web:6c5528f6c0d5769442c577',
  apiKey:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_API_KEY) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_API_KEY) as string) ||
    exampleConfig.apiKey ||
    'AIzaSy_DEACTIVATED_KEY',
  authDomain:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN) as string) ||
    exampleConfig.authDomain ||
    'woven-bee-hghtt.firebaseapp.com',
  storageBucket:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET) as string) ||
    exampleConfig.storageBucket ||
    'woven-bee-hghtt.firebasestorage.app',
  messagingSenderId:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID) as string) ||
    exampleConfig.messagingSenderId ||
    '931598103766',
  oAuthClientId:
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_OAUTH_CLIENT_ID) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_OAUTH_CLIENT_ID) as string) ||
    exampleConfig.oAuthClientId ||
    '931598103766-8d8nv4viadfsumerj2ghpgj7iet85poe.apps.googleusercontent.com',
};

export default firebaseConfig;
