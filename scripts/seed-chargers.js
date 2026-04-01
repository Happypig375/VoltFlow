#!/usr/bin/env node
// Do npm seed:chargers:local to run with .env.seed.local (which should have an absolute path to your Firebase service account JSON key)

import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('Missing GOOGLE_APPLICATION_CREDENTIALS env var.');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const chargers = [
  {
    id: 'charger_a1',
    name: 'Downtown Fast Charger A1',
    latitude: 37.7749,
    longitude: -122.4194,
    power_kw: 120,
    connector_type: 'CCS',
    status: 'available',
    location_description: 'Downtown Plaza Parking Level 1',
  },
  {
    id: 'charger_b2',
    name: 'Riverfront Charger B2',
    latitude: 37.779,
    longitude: -122.414,
    power_kw: 75,
    connector_type: 'Type2',
    status: 'occupied',
    location_description: 'Riverfront Mall East Entrance',
  },
  {
    id: 'charger_c3',
    name: 'City Center Supercharger C3',
    latitude: 37.768,
    longitude: -122.429,
    power_kw: 150,
    connector_type: 'Tesla',
    status: 'available',
    location_description: 'City Center Underground Lot',
  },
];

async function seed() {
  for (const charger of chargers) {
    await db.collection('chargers').doc(charger.id).set(charger, { merge: true });
    console.log(`Seeded ${charger.id}`);
  }
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
