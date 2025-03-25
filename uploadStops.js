import fs from 'fs';
import path from 'path';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const serviceAccount = path.resolve('notiapp-a3e3b-firebase-adminsdk-fbsvc-0779a07a3b.json'); // Ensure the service account file is in the same directory

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Use relative path for stops.txt (same folder as the script)
const filePath = './stops.txt';  // Direct reference to stops.txt in the same folder

// Function to read the stops file and upload data to Firestore
const uploadStops = () => {
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading stops.txt:', err);
      return;
    }

    // Process the stops data, assuming each line is a stop entry
    const stops = data.split('\n').map((line) => {
      const [stopId, stopCode, stopName, stopDesc, stopLat, stopLon, zoneId, stopUrl, locationType, parentStation] = line.split(',');

      // Check if all fields are defined and valid
      if (stopId && stopCode && stopName && stopLat && stopLon) {
        return {
          stopId: stopId.trim(),
          stopCode: stopCode.trim(),
          stopName: stopName.trim(),
          stopDesc: stopDesc ? stopDesc.trim() : '',
          stopLat: parseFloat(stopLat.trim()),
          stopLon: parseFloat(stopLon.trim()),
          zoneId: zoneId ? zoneId.trim() : '',
          stopUrl: stopUrl ? stopUrl.trim() : '',
          locationType: locationType ? locationType.trim() : '',
          parentStation: parentStation ? parentStation.trim() : '',
        };
      }
      return null;  // Skip invalid or incomplete lines
    }).filter(stop => stop !== null);  // Remove any null entries

    // Upload each stop to Firestore
    for (const stop of stops) {
      try {
        const stopRef = db.collection('stops').doc(stop.stopId);
        await stopRef.set(stop);
        console.log(`Stop ${stop.stopId} added to Firestore`);
      } catch (error) {
        console.error('Error uploading stop:', error);
      }
    }

    console.log('All stops uploaded!');
  });
};

// Run the function to upload the stops
uploadStops();
