import { db, auth } from '@/api/firebaseClient';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export async function createSession(data) {
  const user = auth.currentUser;
  const docRef = await addDoc(collection(db, 'charging_sessions'), {
    ...data,
    created_by: user?.email ?? '',
    created_date: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

export async function getUserSessions(email) {
  const q = query(
    collection(db, 'charging_sessions'),
    where('created_by', '==', email),
    orderBy('created_date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    created_date: d.data().created_date?.toDate?.()?.toISOString() ?? null,
  }));
}
