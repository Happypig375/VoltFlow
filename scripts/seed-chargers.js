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

const chargerLocations = [
  {
    name: 'Tower 1 & 2',
    latitude: 22.33986727259181,
    longitude: 114.26291080847784,
    chargers: ['T1-35', 'T1-39', 'T1-60', 'T1-63', 'T1-65', 'T1-68'],
  },
  {
    name: 'Tower 3 & 4',
    latitude: 22.33932227283952,
    longitude: 114.26436472789554,
    chargers: ['T3-21', 'T3-39', 'T3-47', 'T3-54', 'T3-57', 'T3-62'],
  },
  {
    name: 'Tower 5 to 7',
    latitude: 22.33897487861388,
    longitude: 114.26535483423766,
    chargers: ['T5-48', 'T5-49', 'T5-50', 'T5-51'],
  },
  {
    name: 'Tower 8',
    latitude: 22.33442227753281,
    longitude: 114.26570860912722,
    chargers: ['T8-24', 'T8-29'],
  },
  {
    name: 'Tower 9',
    latitude: 22.334509052959582,
    longitude: 114.26593649284686,
    chargers: ['T9-39', 'T9-41'],
  },
  {
    name: 'Tower 10',
    latitude: 22.334542836169383,
    longitude: 114.26621476442045,
    chargers: ['T10-48', 'T10-51', 'T10-53'],
  },
  {
    name: 'Tower 11',
    latitude: 22.334542836169383,
    longitude: 114.26644433846982,
    chargers: ['T11-60', 'T11-63', 'T11-66'],
  },
  {
    name: 'Tower 12',
    latitude: 22.334392892927074,
    longitude: 114.2666164684327,
    chargers: ['T12-70'],
  },
  {
    name: 'Tower 13',
    latitude: 22.334276863704073,
    longitude: 114.26687718565864,
    chargers: ['T13-77', 'T13-78'],
  },
  {
    name: 'Tower 14',
    latitude: 22.33414490878411,
    longitude: 114.26716495844576,
    chargers: ['T14-85'],
  },
  {
    name: 'Tower 15',
    latitude: 22.33427723182408,
    longitude: 114.2673784481617,
    chargers: ['T15-91'],
  },
  {
    name: 'Tower 16',
    latitude: 22.3340671772981,
    longitude: 114.26752309281522,
    chargers: ['T16-94'],
  },
  {
    name: 'Tower 17 to 19',
    latitude: 22.333371842599995,
    longitude: 114.26752086510176,
    chargers: ['T17-109', 'T17-113', 'T17-118', 'T17-127', 'T17-133'],
  },
  {
    name: 'Block P',
    latitude: 22.33896729521354,
    longitude: 114.25826411346323,
    chargers: ['P-1', 'P-4'],
  },
  {
    name: 'Block R',
    latitude: 22.339248930697117,
    longitude: 114.25818968328404,
    chargers: ['R-1', 'R-6'],
  },
  {
    name: 'Block S',
    latitude: 22.339457549206568,
    longitude: 114.2585099585977,
    chargers: ['S-1', 'S-4'],
  },
  {
    name: 'Apartment',
    latitude: 22.339922060815226,
    longitude: 114.25964614393052,
    chargers: ['APT-62', 'APT-72', 'APT-75', 'APT-80', 'APT-82', 'APT-84'],
  },
  {
    name: 'Carpark Building',
    latitude: 22.338719599595834,
    longitude: 114.26302252968912,
    chargers: [
      'LG2-125', 'LG2-126', 'LG2-127', 'LG5-36', 'LG5-37', 'LG5-38', 'LG5-39', 'LG5-40',
      'LG5-41', 'LG5-42', 'LG5-43', 'LG5-44', 'LG5-45', 'LG5-46', 'LG5-47', 'LG5-48',
      'LG5-49', 'LG5-50', 'LG6-1', 'LG6-2', 'LG6-3', 'LG6-4', 'LG6-5', 'LG6-6',
      'LG6-7', 'LG6-8', 'LG6-9', 'LG6-10',
    ],
  },
];

const statusCycle = [
  'available',
  'occupied',
  'available',
  'available',
  'occupied',
  'available',
  'occupied',
  'available',
  'offline',
];

function getConnectorType(chargerId) {
  if (chargerId.startsWith('LG')) return 'Type2';
  if (chargerId.startsWith('APT')) return 'Type2';
  if (chargerId.startsWith('P-') || chargerId.startsWith('R-') || chargerId.startsWith('S-')) return 'Type2';
  return 'Type2';
}

function getPowerKw(chargerId) {
  if (chargerId.startsWith('LG')) return 11;
  if (chargerId.startsWith('APT')) return 7;
  if (chargerId.startsWith('P-') || chargerId.startsWith('R-') || chargerId.startsWith('S-')) return 7;
  return 11;
}

const chargers = chargerLocations.flatMap((location, locationIndex) => {
  return location.chargers.map((chargerId, chargerIndex) => {
    const sequence = locationIndex + chargerIndex;
    const status = statusCycle[sequence % statusCycle.length];

    return {
      id: chargerId,
      name: chargerId,
      latitude: location.latitude,
      longitude: location.longitude,
      power_kw: getPowerKw(chargerId),
      connector_type: getConnectorType(chargerId),
      status,
      location_description: location.name,
    };
  });
});

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
