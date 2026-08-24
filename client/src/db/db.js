import Dexie from 'dexie';

// 1. Initialize the Dexie database
export const db = new Dexie('AgriEdgeDB');

// 2. Define the schema (classId matches Lakshay's model output)
db.version(1).stores({
  treatments: 'classId, cropName, diseaseName, organicAction, chemicalSpray'
});

// 3. Create the initial seed data
const INITIAL_TREATMENTS = [
  {
    classId: 'Tomato___Bacterial_spot',
    cropName: 'Tomato',
    diseaseName: 'Bacterial Spot',
    organicAction: 'Prune infected lower foliage immediately. Apply organic fixed-copper fungicide.',
    chemicalSpray: 'Apply copper-mancozeb combination spray during early morning hours.'
  },
  {
    classId: 'Tomato___Early_blight',
    cropName: 'Tomato',
    diseaseName: 'Early Blight',
    organicAction: 'Mulch soil surface to prevent spore splashback. Remove yellowing bottom leaves.',
    chemicalSpray: 'Apply preventive Chlorothalonil or Azoxystrobin spray every 7–10 days.'
  },
  {
    classId: 'Pepper,_bell___healthy',
    cropName: 'Bell Pepper',
    diseaseName: 'Healthy Leaf',
    organicAction: 'No action required. Maintain balanced drip irrigation and pest monitoring.',
    chemicalSpray: 'None required.'
  }
  // You can add the rest of the 38 classes here later
];

// 4. Function to populate the database on first load
export async function initDatabase() {
  try {
    const count = await db.treatments.count();
    if (count === 0) {
      await db.treatments.bulkPut(INITIAL_TREATMENTS);
      console.log('IndexedDB initialized with agronomic treatment tiers.');
    }
  } catch (error) {
    console.error('Failed to initialize local database:', error);
  }
}