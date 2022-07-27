import firebaseConfig from "../../config/firebase";
import { initializeApp as initApp, getApps } from "firebase/app";
import {
  initializeApp as initAdminApp,
  getApps as getAppsAdmin,
} from "firebase-admin/app";
import { credential } from "firebase-admin";
import { getFirestore, addDoc, collection } from "firebase/firestore";

export default async function handler(req, res) {
  let clientError = false;

  if (req.method !== "POST") {
    res.status(400).json({ message: "Invalid request" });
  }

  const { name, reservation_time, phone, units } = req.body;

  if (!name.length || name.length > 15) {
    clientError = true;
  }

  if (!phone.length || phone.length > 15) {
    clientError = true;
  }

  if (units < 1 || units > 6) {
    clientError = true;
  }

  if (!reservation_time) {
    clientError = true;
  }

  if (clientError) {
    res.status(400).json({
      message: "Please fill in the form correctly.",
    });
  }

  var serviceAccount = JSON.parse(process.env.NEXT_PUBLIC_FB_ADMIN_SERVICE_ACC);

  if (getAppsAdmin().length < 1) {
    initAdminApp({
      credential: credential.cert(serviceAccount),
    });
  }

  if (getApps().length < 1) initApp(firebaseConfig);

  const db = getFirestore();

  await addDoc(collection(db, "reservations"), {
    ...req.body,
    time_submitted: new Date().toTimeString().split(" ")[0],
  });

  res.status(200).json({ message: "Success" });
}
