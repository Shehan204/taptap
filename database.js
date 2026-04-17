import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, writeBatch, doc, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBd7jSaXn8Yh3x1RL5JaIczWFB0NxdcaQw",
    authDomain: "mscdb-8d5bf.firebaseapp.com",
    projectId: "mscdb-8d5bf",
    storageBucket: "mscdb-8d5bf.firebasestorage.app",
    messagingSenderId: "115320223781",
    appId: "1:115320223781:web:3fe22e50741d52c413a7cc",
    measurementId: "G-GS76V0HJM9"
  };
  
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveTapsToDatabase(sessionId, platform, tapsArray) {
    try {
        // Create a Batch
        const batch = writeBatch(db);

        tapsArray.forEach((tap) => {
            // Calculate duration 
            const duration = tap.endTimestamp - tap.startTimestamp;

            const tapRef = doc(collection(db, "tap_logs"));

            batch.set(tapRef, {
                session_id: sessionId,
                device_platform: platform,
                tap_sequence: tap.tapSequenceNumber,
                start_time: tap.startTimestamp,
                end_time: tap.endTimestamp,
                duration: duration, 
                interface_type: tap.interface,
                interface_seq: tap.interfaceSequence,
                created_at: Date.now()
            });
        });

        // Send the entire batch at once
        // one single network request
        await batch.commit();
        
        return { success: true };
    } catch (error) {
        console.error("Batch Write Error:", error);
        return { success: false, error: error };
    }
}