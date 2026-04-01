import { db } from '@/api/firebaseClient';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function listChargers() {
  const snap = await getDocs(collection(db, 'chargers'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCharger(id) {
  const snap = await getDoc(doc(db, 'chargers', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
