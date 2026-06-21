import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString("utf-8")
);

const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });

export const adminDb = getFirestore(app);
