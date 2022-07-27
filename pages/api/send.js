import firebase from "firebase/app";
import firebaseConfig from "../../config/firebase";
import "firebase/messaging";

export default function handler(req, res) {
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

  if (clientError) {
    res.status(400).json({
      message: "Please fill in the form correctly.",
    });
  }

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  res.status(200).json({ name: "John Doe" });
}
