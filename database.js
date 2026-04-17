import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, writeBatch, doc, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCdOksRA1aa6RXvZBvzbUVG5Ql7IN9vywk",
    authDomain: "mscdb-36157.firebaseapp.com",
    projectId: "mscdb-36157",
    storageBucket: "mscdb-36157.firebasestorage.app",
    messagingSenderId: "738239395493",
    appId: "1:738239395493:web:8bb22744c8ad89b4ffbf4c"
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
