import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDH7nc_gn3HghKNfqn3ma5ZBwaEQjOojvg",
  authDomain: "database-iot-kel4.firebaseapp.com",
  databaseURL: "https://database-iot-kel4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "database-iot-kel4",
  storageBucket: "database-iot-kel4.firebasestorage.app",
  messagingSenderId: "156281904270",
  appId: "1:156281904270:web:52787a7489869fae3c7ddf"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);