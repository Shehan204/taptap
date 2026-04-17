import { getFirestore, collection, query, where, getAggregateFromServer, average, count, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function runGlobalStats(db) {
    const colRef = collection(db, "tap_logs");

    try {
        // Mean for Android vs PC
        const qAndroid = query(colRef, where("device_platform", "==", "android"));
        const qPC = query(colRef, where("device_platform", "==", "pc"));
        
        const [androidSnap, pcSnap] = await Promise.all([
            getAggregateFromServer(qAndroid, { avg: average("duration") }),
            getAggregateFromServer(qPC, { avg: average("duration") })
        ]);

        // Mean for Feedback vs No-Feedback
        const qFeed = query(colRef, where("interface_type", "==", "feedbackshown"));
        const qNoFeed = query(colRef, where("interface_type", "==", "nofeedback"));
        
        const [feedSnap, noFeedSnap] = await Promise.all([
            getAggregateFromServer(qFeed, { avg: average("duration") }),
            getAggregateFromServer(qNoFeed, { avg: average("duration") })
        ]);

        // Finished vs Drop-off 
        // Fetch only session_id and seq to save bandwidth
        const allDocs = await getDocs(colRef);
        const sessions = {};
        allDocs.forEach(doc => {
            const data = doc.data();
            if(!sessions[data.session_id] || data.interface_seq > sessions[data.session_id]) {
                sessions[data.session_id] = data.interface_seq;
            }
        });

        const completed = Object.values(sessions).filter(seq => seq >= 2).length;
        const dropped = Object.values(sessions).filter(seq => seq === 1).length;

        return {
            android: Math.round(androidSnap.data().avg || 0),
            pc: Math.round(pcSnap.data().avg || 0),
            feedback: Math.round(feedSnap.data().avg || 0),
            noFeedback: Math.round(noFeedSnap.data().avg || 0),
            completed,
            dropped
        };
    } catch (e) {
        console.error("Analysis Error:", e);
        return null;
    }
}