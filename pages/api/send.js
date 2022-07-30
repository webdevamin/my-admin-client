import firebaseConfig from "../../config/firebase";
import { initializeApp as initApp, getApps } from "firebase/app";
import {
  initializeApp as initAdminApp,
  getApps as getAppsAdmin,
} from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { credential } from "firebase-admin";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  query,
} from "firebase/firestore";

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

  var serviceAccount = JSON.parse(process.env.FB_ADMIN_SERVICE_ACC);

  if (getAppsAdmin().length < 1) {
    initAdminApp({
      credential: credential.cert(serviceAccount),
    });
  }

  if (getApps().length < 1) initApp(firebaseConfig);

  const db = getFirestore();
  const registrationTokens = [];
  // FCM Tokens a.k.a. device tokens or registration tokens
  const querySnapshot = await getDocs(query(collection(db, "fcm_tokens")));

  querySnapshot.forEach((doc) => {
    registrationTokens.push(doc.data().token_id);
  });

  const message = {
    data: {
      title: `New reservation`,
      body: `New reservation at ${reservation_time} by ${name}.`,
    },
    tokens: registrationTokens,
  };

  console.log("sending message");

  await getMessaging()
    .sendMulticast(message)
    .then((response) => {
      console.log("sent");
      console.log(response.successCount + " messages were sent successfully");
    });

  await addDoc(collection(db, "reservations"), {
    ...req.body,
    date_submitted: new Date().toLocaleString("nl-BE", {
      timeZone: "Europe/Brussels",
    }),
  });

  res.status(200).json({ message: "Success" });
}
