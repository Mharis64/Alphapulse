import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDocs,
  deleteDoc, doc, query, orderBy, limit, Firestore,
} from 'firebase/firestore';
import { SentimentResult, WatchlistItem } from '../types';

// ⬇️ REPLACE ALL VALUES — Firebase Console → Project Settings → Your apps
const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};

let app: FirebaseApp;
let db: Firestore;

export function initFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
}

export function getDb(): Firestore {
  if (!db) initFirebase();
  return db;
}

export async function saveSentimentResult(result: SentimentResult): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'sentiment_results'), result);
  return ref.id;
}

export async function fetchRecentResults(limitCount = 20): Promise<SentimentResult[]> {
  try {
    const q = query(
      collection(getDb(), 'sentiment_results'),
      orderBy('meta.analyzed_at', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SentimentResult));
  } catch {
    return [];
  }
}

export async function addToWatchlist(item: Omit<WatchlistItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'watchlist'), item);
  return ref.id;
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  try {
    const q = query(collection(getDb(), 'watchlist'), orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WatchlistItem));
  } catch {
    return [];
  }
}

export async function removeFromWatchlist(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'watchlist', id));
}