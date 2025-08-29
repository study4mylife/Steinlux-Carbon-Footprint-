import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyBm2oNcPhQ5nbQbLrvQUnlQ31LoxX3JThM",
  authDomain: "steinlux-calculator.firebaseapp.com",
  projectId: "steinlux-calculator",
  storageBucket: "steinlux-calculator.firebasestorage.app",
  messagingSenderId: "180210584345",
  appId: "1:180210584345:web:759888650c808df8159388",
  measurementId: "G-VX9JK5P5DF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const functions = getFunctions(app);

// 儲存資料
export async function saveSectionData(sectionName, data) {
  const userId = getUserId();
  await set(ref(db, `responses/${userId}/${sectionName}`), data);
}

// 讀取資料
export async function loadSectionData(sectionName) {
  const userId = getUserId();
  const snapshot = await get(child(ref(db), `responses/${userId}/${sectionName}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// 產生/記錄 userId
function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user_${Date.now()}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
}


export { db, ref, set, get, child, functions, httpsCallable};

