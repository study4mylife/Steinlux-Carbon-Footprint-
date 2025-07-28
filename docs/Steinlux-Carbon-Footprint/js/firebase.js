// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

// 用 localStorage 模擬 uid
let uid = localStorage.getItem("uid");
if (!uid) {
  uid = "user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  localStorage.setItem("uid", uid);
}

// 儲存資料
export async function saveSectionData(section, data) {
  const docRef = doc(db, "carbonFootprint-data", uid);
  try {
    await setDoc(docRef, { [section]: data }, { merge: true });
    console.log(`✅ ${section} 資料儲存成功`, data);
  } catch (e) {
    console.error(`❌ 儲存 ${section} 資料失敗`, e);
  }
}

// 讀取資料
export async function loadSectionData(section) {
  const docRef = doc(db, "steinlux-data", uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()[section] || null;
    }
    return null;
  } catch (e) {
    console.error(`❌ 讀取 ${section} 資料失敗`, e);
    return null;
  }
}

export { db };
