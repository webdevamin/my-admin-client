import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.scss'
import axios from "axios";
import firebaseConfig from "../config/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const initForm = {
  name: '', phone: '', reservation_time: '', units: 1, time_submitted: ''
}

const reservationTimes = ['12:00', '12:30', '13:00', '13:30', '14:00'];

const Home = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }

  const db = firebase.firestore();

  const [form, setForm] = useState(initForm);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({ ...form, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/send', form);

      db.collection("reservations").add({
        ...form,
        time_submitted: (new Date).toTimeString().split(' ')[0]
      }).then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
      }).catch((error) => {
        console.error("Error adding document: ", error);
      })

    } catch (e) {
      if (e.response) {
        const { message } = e.response.data;
        setError(message);
      }
      else {
        console.error("Error adding document: ", e);
        setError('Something went wrong. Please try again later');
      }
    }

    setForm(initForm);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>My Admin Client</title>
        <meta name="description" content="My Admin Client" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <form onSubmit={handleSubmit}>
          {
            error && <p className={styles.error}>{error}</p>
          }
          <label>
            <input type="text" name="name" placeholder='Name'
              maxLength="15" value={form.name} required onChange={handleChange} />
          </label>
          <label>
            <input type="tel" name="phone" maxLength="15" placeholder='Phone number'
              value={form.phone} required onChange={handleChange} />
          </label>
          <label>
            <select name="reservation_time" value={form.reservation_time}
              onChange={handleChange}>
              {
                reservationTimes.map((reservationTime, index) => {
                  return (
                    <option key={index} value={reservationTime}>
                      {reservationTime}
                    </option>
                  )
                })
              }
            </select>
          </label>
          <label>
            <input type="number" min={1} max={6} name="units"
              value={form.units} required onChange={handleChange} />
          </label>
          <input type='submit' value='Book now' />
        </form>
      </main>
    </div>
  )
}

export default Home;