// =====================================================
// FIREBASE WEB SDK (modular) - doc cam bien + dieu khien LED
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// =====================================================
// 1. FIREBASE CONFIG
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyBkq8WuHHUFH539hsWlKVIAM9q3kal1DGU",
  authDomain: "smarthome-baedd.firebaseapp.com",
  databaseURL: "https://smarthome-baedd-default-rtdb.firebaseio.com",
  projectId: "smarthome-baedd",
  storageBucket: "smarthome-baedd.firebasestorage.app",
  messagingSenderId: "242977774353",
  appId: "1:242977774353:web:897272f124a09497b5cab0",
  measurementId: "G-2FNBS9X1DX"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// =====================================================
// 2. CAU HINH PHONG
//   firebasePath : node chua nhiet do / do am
//   ledPath      : node chua trang thai den (true = bat, false = tat)
//   deviceId     : id checkbox tuong ung o phan "Dieu khien thiet bi"
// =====================================================
const ROOM_CONFIG = {
  room1: { firebasePath: "sensor",  ledPath: "control/room1/led", deviceId: "livingLight" },
  room2: { firebasePath: "sensor1", ledPath: "control/room2/led", deviceId: "bedroomLight" },
};

// Nguong de danh gia trang thai "Tot" / "Can chu y"
const TEMP_GOOD_MIN = 18;
const TEMP_GOOD_MAX = 30;
const HUM_GOOD_MIN = 30;
const HUM_GOOD_MAX = 70;

// Khoang gia tri hien thi tren thanh progress
const TEMP_RANGE = { min: 15, max: 35 };
const HUM_RANGE = { min: 30, max: 90 };

// ESP duoc coi la OFFLINE neu qua thoi gian nay khong co du lieu moi
const OFFLINE_TIMEOUT = 15000; // 15 giay

const roomState = {};
Object.keys(ROOM_CONFIG).forEach((roomId) => {
  roomState[roomId] = { prevTemp: null, prevHum: null, lastReceived: null };
});

// =====================================================
// 3. HAM TIEN ICH
// =====================================================
function clampPercent(value, min, max) {
  const p = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, p));
}

function tempStatusLabel(t) {
  if (t >= TEMP_GOOD_MIN && t <= TEMP_GOOD_MAX) return { cls: "good", text: "Tốt" };
  return { cls: "normal", text: t > TEMP_GOOD_MAX ? "Cao" : "Thấp" };
}

function humStatusLabel(h) {
  if (h >= HUM_GOOD_MIN && h <= HUM_GOOD_MAX) return { cls: "good", text: "Tốt" };
  return { cls: "normal", text: h > HUM_GOOD_MAX ? "Cao" : "Thấp" };
}

function setStatusBadge(el, statusInfo) {
  el.textContent = statusInfo.text;
  el.classList.remove("good", "normal");
  el.classList.add(statusInfo.cls);
}

function setChangeIndicator(wrapperEl, iconEl, valueEl, delta, unit) {
  const isUp = delta >= 0;
  wrapperEl.classList.remove("up", "down");
  wrapperEl.classList.add(isUp ? "up" : "down");
  iconEl.className = `bi bi-arrow-${isUp ? "up" : "down"}`;
  valueEl.textContent = `${Math.abs(delta).toFixed(1)}${unit}`;
}

function setEspStatus(roomId, isOnline) {
  const dot = document.getElementById(`${roomId}-esp-dot`);
  const text = document.getElementById(`${roomId}-esp-text`);
  if (!dot || !text) return;

  dot.classList.remove("online", "offline");
  dot.classList.add(isOnline ? "online" : "offline");
  text.textContent = isOnline
    ? "Đang hoạt động"
    : `Mất kết nối (>${OFFLINE_TIMEOUT / 1000}s)`;
}

// =====================================================
// 4. CAP NHAT UI CAM BIEN CHO 1 PHONG
// =====================================================
function updateRoomUI(roomId, data) {
  const state = roomState[roomId];
  if (!state || !data) return;

  const { temperature, humidity } = data;

  // ---- Nhiet do ----
  if (temperature !== undefined && temperature !== null) {
    const t = Number(temperature);
    const valueEl = document.getElementById(`${roomId}-temperature`);
    const barEl = document.getElementById(`${roomId}-temperature-bar`);
    const statusEl = document.getElementById(`${roomId}-temp-status`);
    const changeWrapperEl = document.getElementById(`${roomId}-temperature-change`)?.parentElement;
    const changeIconEl = changeWrapperEl?.querySelector("i");
    const changeValueEl = document.getElementById(`${roomId}-temperature-change`);

    if (valueEl) valueEl.textContent = `${t.toFixed(1)}°C`;
    if (barEl) barEl.style.width = `${clampPercent(t, TEMP_RANGE.min, TEMP_RANGE.max)}%`;
    if (statusEl) setStatusBadge(statusEl, tempStatusLabel(t));

    if (state.prevTemp !== null && changeWrapperEl && changeIconEl && changeValueEl) {
      setChangeIndicator(changeWrapperEl, changeIconEl, changeValueEl, t - state.prevTemp, "°C");
    }
    state.prevTemp = t;
  }

  // ---- Do am ----
  if (humidity !== undefined && humidity !== null) {
    const h = Number(humidity);
    const valueEl = document.getElementById(`${roomId}-humidity`);
    const barEl = document.getElementById(`${roomId}-humidity-bar`);
    const statusEl = document.getElementById(`${roomId}-hum-status`);
    const changeWrapperEl = document.getElementById(`${roomId}-humidity-change`)?.parentElement;
    const changeIconEl = changeWrapperEl?.querySelector("i");
    const changeValueEl = document.getElementById(`${roomId}-humidity-change`);

    if (valueEl) valueEl.textContent = `${h.toFixed(0)}%`;
    if (barEl) barEl.style.width = `${clampPercent(h, HUM_RANGE.min, HUM_RANGE.max)}%`;
    if (statusEl) setStatusBadge(statusEl, humStatusLabel(h));

    if (state.prevHum !== null && changeWrapperEl && changeIconEl && changeValueEl) {
      setChangeIndicator(changeWrapperEl, changeIconEl, changeValueEl, h - state.prevHum, "%");
    }
    state.prevHum = h;
  }

  state.lastReceived = Date.now();
  setEspStatus(roomId, true);
}

// =====================================================
// 5. LANG NGHE FIREBASE - CAM BIEN
// =====================================================
Object.entries(ROOM_CONFIG).forEach(([roomId, config]) => {
  const roomRef = ref(database, config.firebasePath);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    updateRoomUI(roomId, data);
  });
});

// =====================================================
// 6. DIEU KHIEN DEN
// -----------------------------------------------------
// - Nut Bat/Tat (room1-btn-on / room1-btn-off) goi setRoomLight()
//   -> ghi true/false len Firebase
// - Giao dien KHONG tu doi khi bam, ma doi theo gia tri that
//   tren Firebase (onValue ben duoi). Firebase se bao ve ngay
//   tren may nay nen van thay doi tuc thi, va tu quay ve neu
//   ghi that bai (vi du sai Rules).
// =====================================================
function updateLightUI(roomId, isOn) {
  const stateEl = document.getElementById(`${roomId}-light-state`);
  const statusEl = document.getElementById(`${roomId}-light-status`);
  const btnOn = document.getElementById(`${roomId}-btn-on`);
  const btnOff = document.getElementById(`${roomId}-btn-off`);

  if (stateEl) {
    stateEl.textContent = isOn ? "BẬT" : "TẮT";
    stateEl.classList.toggle("on", isOn);
    stateEl.classList.toggle("off", !isOn);
  }

  if (statusEl) {
    statusEl.textContent = isOn ? "Đang sáng" : "Đang tắt";
    statusEl.classList.toggle("good", isOn);
    statusEl.classList.toggle("normal", !isOn);
  }

  if (btnOn) btnOn.classList.toggle("active", isOn);
  if (btnOff) btnOff.classList.toggle("active", !isOn);

  // Dong bo cong tac o phan "Dieu khien thiet bi"
  const deviceId = ROOM_CONFIG[roomId]?.deviceId;
  const deviceToggle = deviceId ? document.getElementById(deviceId) : null;
  if (deviceToggle) {
    deviceToggle.checked = isOn;
    const infoSpan = deviceToggle.closest(".device-card")?.querySelector(".device-info span");
    if (infoSpan) infoSpan.textContent = isOn ? "Đang sáng" : "Đang tắt";
  }
}

function sendLightCommand(roomId, isOn) {
  const config = ROOM_CONFIG[roomId];
  if (!config || !config.ledPath) return;

  set(ref(database, config.ledPath), isOn).catch((err) => {
    console.error(`Loi ghi den ${roomId}:`, err);
    alert("Không gửi được lệnh. Kiểm tra Firebase Rules / kết nối mạng.");
  });
}

// Ghi de ham setRoomLight trong index.html (onclick cua 2 nut Bat/Tat)
window.setRoomLight = (roomId, isOn) => sendLightCommand(roomId, isOn);

// Ham cho cac cong tac o phan "Dieu khien thiet bi"
window.controlDevice = (deviceId, isOn) => {
  const roomId = Object.keys(ROOM_CONFIG).find(
    (id) => ROOM_CONFIG[id].deviceId === deviceId
  );
  if (roomId) {
    sendLightCommand(roomId, isOn);
  } else {
    // Quat, rem cua, dieu hoa... chua co phan cung
    console.log(`Thiet bi "${deviceId}" chua duoc noi voi Firebase`);
  }
};

// Lang nghe trang thai den tren Firebase de cap nhat giao dien
Object.entries(ROOM_CONFIG).forEach(([roomId, config]) => {
  if (!config.ledPath) return;
  onValue(ref(database, config.ledPath), (snapshot) => {
    const val = snapshot.val();
    updateLightUI(roomId, val === true || val === 1);
  });
});

// =====================================================
// 7. KIEM TRA ONLINE / OFFLINE THEO CHU KY
// =====================================================
setInterval(() => {
  Object.keys(ROOM_CONFIG).forEach((roomId) => {
    const state = roomState[roomId];
    if (state.lastReceived === null) return;

    const elapsed = Date.now() - state.lastReceived;
    if (elapsed > OFFLINE_TIMEOUT) {
      setEspStatus(roomId, false);
    }
  });
}, 3000);