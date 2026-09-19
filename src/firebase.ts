import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Trip } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB persistent local cache
// This dramatically reduces server read quota usage by serving unchanged docs from client cache
// experimentalForceLongPolling: true ensures reliable connectivity in proxy/iframe environments without transient streaming connection drops
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Attempt anonymous sign-in to establish authenticated session
signInAnonymously(auth).catch((err) => {
  console.info('Firebase auth session note (operating with offline/anonymous fallback):', err?.message || err);
});

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function isFirestoreUnavailableError(error: unknown): boolean {
  const errCode = (error as { code?: string })?.code;
  const msg = String(error || '');
  return (
    errCode === 'unavailable' ||
    errCode === 'resource-exhausted' ||
    msg.includes('unavailable') ||
    msg.includes('offline') ||
    msg.includes('backend') ||
    msg.includes('network') ||
    msg.includes('Could not reach')
  );
}

// Collection references
const TRIPS_COLLECTION = 'trips';
const SETTINGS_COLLECTION = 'settings';
const LOGO_DOC_ID = 'brand_logo';

/**
 * Real-time listener for all trips from Firestore.
 * Automatically handles offline fallbacks, quota limits, and error mapping.
 */
export function subscribeToCloudTrips(
  onData: (trips: Trip[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const tripsRef = collection(db, TRIPS_COLLECTION);
  return onSnapshot(
    tripsRef,
    (snapshot) => {
      const tripsList: Trip[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Trip;
        tripsList.push({
          ...data,
          id: docSnap.id,
        });
      });
      onData(tripsList);
    },
    (error) => {
      if (isFirestoreUnavailableError(error)) {
        console.info('Cloud Firestore beroperasi dalam mode offline/cache lokal.');
      } else {
        console.error('Error listening to Cloud Firestore trips:', error);
      }
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Sanitize trip object for Cloud Firestore.
 * Removes undefined/null values that trigger Firestore write exceptions.
 */
export function sanitizeTripForFirestore(trip: Trip): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(trip)) {
    if (val !== undefined && val !== null) {
      clean[key] = val;
    }
  }
  clean.updatedAt = new Date().toISOString();
  return clean;
}

/**
 * Save or update a trip in Cloud Firestore.
 */
export async function saveTripToCloud(trip: Trip): Promise<void> {
  const path = `${TRIPS_COLLECTION}/${trip.id}`;
  try {
    const tripDocRef = doc(db, TRIPS_COLLECTION, trip.id);
    const sanitized = sanitizeTripForFirestore(trip);
    await setDoc(tripDocRef, sanitized, { merge: true });
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      console.warn(`[Firestore Offline] Trip ${trip.id} disimpan di cache lokal dan akan disinkronkan saat terhubung kembali.`);
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a trip from Cloud Firestore.
 */
export async function deleteTripFromCloud(tripId: string): Promise<void> {
  const path = `${TRIPS_COLLECTION}/${tripId}`;
  try {
    const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripDocRef);
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      console.warn(`[Firestore Offline] Penghapusan trip ${tripId} dicatat di cache lokal.`);
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seed initial trips to Cloud Firestore if cloud database is empty.
 */
export async function seedInitialTripsToCloud(initialTrips: Trip[]): Promise<void> {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const snapshot = await getDocs(tripsRef);
    if (snapshot.empty && initialTrips.length > 0) {
      const batch = writeBatch(db);
      for (const trip of initialTrips) {
        const tripDoc = doc(db, TRIPS_COLLECTION, trip.id);
        const sanitized = sanitizeTripForFirestore(trip);
        batch.set(tripDoc, sanitized);
      }
      await batch.commit();
      console.log('Successfully seeded initial trips to Cloud Firestore');
    }
  } catch (error) {
    console.warn('Could not seed initial trips to Cloud Firestore:', error);
  }
}

/**
 * Real-time listener for brand logo setting in Cloud Firestore.
 */
export function subscribeToCloudLogo(
  onLogo: (logoUrl: string | null) => void
): Unsubscribe {
  const logoDocRef = doc(db, SETTINGS_COLLECTION, LOGO_DOC_ID);
  return onSnapshot(
    logoDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onLogo(typeof data?.value === 'string' ? data.value : null);
      } else {
        onLogo(null);
      }
    },
    (error) => {
      const errCode = (error as { code?: string })?.code;
      const isUnavailable =
        errCode === 'unavailable' ||
        String(error).includes('offline') ||
        String(error).includes('backend');
      if (isUnavailable) {
        console.info('Cloud logo operating in offline cache mode.');
      } else {
        console.warn('Cloud logo snapshot error:', error);
      }
    }
  );
}

/**
 * Save brand logo to Cloud Firestore.
 */
export async function saveLogoToCloud(logoUrl: string | null): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${LOGO_DOC_ID}`;
  try {
    const logoDocRef = doc(db, SETTINGS_COLLECTION, LOGO_DOC_ID);
    if (logoUrl) {
      await setDoc(logoDocRef, {
        id: LOGO_DOC_ID,
        value: logoUrl,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(logoDocRef);
    }
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      console.warn('[Firestore Offline] Perubahan logo dicatat di cache lokal.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch all trips from Cloud Firestore on demand.
 */
export async function fetchAllCloudTrips(): Promise<Trip[]> {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const snapshot = await getDocs(tripsRef);
    const trips: Trip[] = [];
    snapshot.forEach((docSnap) => {
      trips.push({
        ...(docSnap.data() as Trip),
        id: docSnap.id,
      });
    });
    return trips;
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      console.warn('[Firestore Offline] Membaca daftar trip dari cache lokal.');
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, TRIPS_COLLECTION);
  }
}

/**
 * Manually upload a list of trips to Cloud Firestore.
 */
export async function uploadAllTripsToCloud(trips: Trip[]): Promise<number> {
  if (!trips.length) return 0;
  try {
    const batch = writeBatch(db);
    for (const trip of trips) {
      const tripDoc = doc(db, TRIPS_COLLECTION, trip.id);
      const sanitized = sanitizeTripForFirestore(trip);
      batch.set(tripDoc, sanitized, { merge: true });
    }
    await batch.commit();
    return trips.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, TRIPS_COLLECTION);
  }
}
