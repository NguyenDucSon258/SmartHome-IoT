// =====================================================
// FIREBASE WEB SDK (modular) - RTDB + CLOUD FIRESTORE
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
  measurementId: "G-2FNBS9X1DX",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = getFirestore(app);

// =====================================================
// 2. CẤU HÌNH PHÒNG & NGƯỠNG CẢNH BÁO
// =====================================================
const ROOM_CONFIG = {
  room1: {
    name: "Phòng khách",
    firebasePath: "sensor",
    ledPath: "control/room1/led",
    deviceId: "livingLight",
  },
  room2: {
    name: "Phòng ngủ",
    firebasePath: "sensor1",
    ledPath: "control/room2/led",
    deviceId: "bedroomLight",
  },
};

const SAVE_INTERVAL = 8640; // Lưu Firestore mỗi 8.64s
const TABLE_INTERVAL = 5000; // CHỐNG TRÙNG BẢNG: Cách tối thiểu 5s mới ghi 1 dòng mới vào bảng
const MAX_HISTORY_ROWS = 10;

// NGƯỠNG NHIỆT ĐỘ CẢNH BÁO
const ALERT_TEMP_HIGH = 35.0; // Nhiệt độ cao bất thường (quá nhiệt / cháy nổ)
const ALERT_TEMP_LOW = 15.0; // Nhiệt độ quá lạnh

const TEMP_GOOD_MIN = 18;
const TEMP_GOOD_MAX = 30;
const HUM_GOOD_MIN = 30;
const HUM_GOOD_MAX = 70;

const TEMP_RANGE = { min: 15, max: 35 };
const HUM_RANGE = { min: 30, max: 90 };
const OFFLINE_TIMEOUT = 15000;

const roomHistoryData = {
  room1: [],
  room2: [],
};

const roomState = {};
Object.keys(ROOM_CONFIG).forEach((roomId) => {
  roomState[roomId] = {
    prevTemp: null,
    prevHum: null,
    lastReceived: null,
    lastSavedToFirestore: 0,
    lastTableUpdated: 0, // Thời gian cập nhật bảng lần cuối
    isAlerting: false, // Trạng thái đang cảnh báo
  };
});

// =====================================================
// 3. HÀM CẢNH BÁO NHIỆT ĐỘ VƯỢT NGƯỠNG
// =====================================================
// Phát âm thanh bíp cảnh báo bằng AudioContext tích hợp sẵn
function playAlertBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Âm báo tần số 880Hz
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35); // Kêu 0.35 giây
  } catch (e) {
    console.warn("Trình duyệt chặn âm thanh tự động:", e);
  }
}

// Kiểm tra và hiển thị cảnh báo
function checkTemperatureAlert(roomId, temperature) {
  const state = roomState[roomId];
  const roomName = ROOM_CONFIG[roomId].name;
  const tempCard = document
    .getElementById(`${roomId}-temperature`)
    ?.closest(".sensor-card");

  const isOverHeat = temperature >= ALERT_TEMP_HIGH;
  const isTooCold = temperature <= ALERT_TEMP_LOW;

  if (isOverHeat || isTooCold) {
    if (!state.isAlerting) {
      state.isAlerting = true;
      playAlertBeep();

      const reason = isOverHeat
        ? `QUÁ CAO (${temperature}°C)`
        : `QUÁ THẤP (${temperature}°C)`;
      console.warn(`[CẢNH BÁO] Nhiệt độ ${roomName} đang ${reason}!`);

      // Thêm viền đỏ nhấp nháy cho thẻ cảm biến
      if (tempCard) {
        tempCard.style.border = "2px solid #ef4444";
        tempCard.style.boxShadow = "0 0 15px rgba(239, 68, 68, 0.4)";
      }

      // Thông báo Toast trên góc màn hình
      showToastAlert(`⚠️ CẢNH BÁO: Nhiệt độ ${roomName} ${reason}!`);
    }
  } else {
    // Trở về bình thường
    if (state.isAlerting) {
      state.isAlerting = false;
      if (tempCard) {
        tempCard.style.border = "";
        tempCard.style.boxShadow = "";
      }
    }
  }
}

// Hàm vẽ khung thông báo Toast nổi
function showToastAlert(message) {
  let toast = document.getElementById("alert-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "alert-toast";
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.zIndex = "9999";
    toast.style.backgroundColor = "#fee2e2";
    toast.style.color = "#b91c1c";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "10px";
    toast.style.fontWeight = "bold";
    toast.style.fontSize = "13px";
    toast.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
    toast.style.border = "1px solid #f87171";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = "block";

  // Tự ẩn sau 4 giây
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

// =====================================================
// 4. HÀM CẬP NHẬT BẢNG (ĐÃ KHẮC PHỤC TRÙNG 1 GIÂY)
// =====================================================
function updateHistoryTable(roomId, temperature, humidity) {
  const now = Date.now();
  const state = roomState[roomId];

  // Chống trùng lặp 1 giây: Chưa trôi qua 5s kể từ lần ghi bảng trước thì bỏ qua
  if (now - state.lastTableUpdated < TABLE_INTERVAL) {
    return;
  }

  const tbody = document.getElementById(`${roomId}-history-body`);
  if (!tbody) return;

  const d = new Date();
  const timeStr = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  roomHistoryData[roomId].unshift({
    time: timeStr,
    temp: Number(temperature).toFixed(1),
    hum: Number(humidity).toFixed(0),
  });

  if (roomHistoryData[roomId].length > MAX_HISTORY_ROWS) {
    roomHistoryData[roomId].pop();
  }

  tbody.innerHTML = roomHistoryData[roomId]
    .map(
      (item) => `
      <tr>
        <td>${item.time}</td>
        <td><strong style="color: #ef4444;">${item.temp}°C</strong></td>
        <td><strong style="color: #3b82f6;">${item.hum}%</strong></td>
      </tr>
    `,
    )
    .join("");

  state.lastTableUpdated = now; // Cập nhật mốc thời gian vừa ghi bảng
}

// =====================================================
// 5. HÀM LƯU DỮ LIỆU VÀO CLOUD FIRESTORE
// =====================================================
function getFormattedTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

async function saveToFirestore(roomId, temperature, humidity) {
  const now = Date.now();
  const state = roomState[roomId];

  if (now - state.lastSavedToFirestore < SAVE_INTERVAL) {
    return;
  }

  try {
    const docId = `${roomId}_${getFormattedTimestamp()}`;

    await setDoc(doc(db, "sensor_history", docId), {
      roomId: roomId,
      roomName: ROOM_CONFIG[roomId].name,
      temperature: Number(temperature),
      humidity: Number(humidity),
      timestamp: serverTimestamp(),
      timeFormatted: new Date().toLocaleString("vi-VN"),
    });

    state.lastSavedToFirestore = now;
    console.log(`[Firestore] Đã lưu bản ghi ID: ${docId}`);
  } catch (error) {
    console.error(`[Firestore] Lỗi lưu dữ liệu ${roomId}:`, error);
  }
}

// =====================================================
// 6. TIỆN ÍCH & TRẠNG THÁI GIAO DIỆN
// =====================================================
function clampPercent(value, min, max) {
  const p = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, p));
}

function tempStatusLabel(t) {
  if (t >= TEMP_GOOD_MIN && t <= TEMP_GOOD_MAX)
    return { cls: "good", text: "Tốt" };
  return { cls: "normal", text: t > TEMP_GOOD_MAX ? "Cao" : "Thấp" };
}

function humStatusLabel(h) {
  if (h >= HUM_GOOD_MIN && h <= HUM_GOOD_MAX)
    return { cls: "good", text: "Tốt" };
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
// 7. CẬP NHẬT CẢM BIẾN CHO PHÒNG & KÍCH HOẠT LƯU
// =====================================================
function updateRoomUI(roomId, data) {
  const state = roomState[roomId];
  if (!state || !data) return;

  const { temperature, humidity } = data;

  // ---- Nhiệt độ ----
  if (temperature !== undefined && temperature !== null) {
    const t = Number(temperature);
    const valueEl = document.getElementById(`${roomId}-temperature`);
    const barEl = document.getElementById(`${roomId}-temperature-bar`);
    const statusEl = document.getElementById(`${roomId}-temp-status`);
    const changeWrapperEl = document.getElementById(
      `${roomId}-temperature-change`,
    )?.parentElement;
    const changeIconEl = changeWrapperEl?.querySelector("i");
    const changeValueEl = document.getElementById(
      `${roomId}-temperature-change`,
    );

    if (valueEl) valueEl.textContent = `${t.toFixed(1)}°C`;
    if (barEl)
      barEl.style.width = `${clampPercent(t, TEMP_RANGE.min, TEMP_RANGE.max)}%`;
    if (statusEl) setStatusBadge(statusEl, tempStatusLabel(t));

    if (
      state.prevTemp !== null &&
      changeWrapperEl &&
      changeIconEl &&
      changeValueEl
    ) {
      setChangeIndicator(
        changeWrapperEl,
        changeIconEl,
        changeValueEl,
        t - state.prevTemp,
        "°C",
      );
    }
    state.prevTemp = t;

    // KIỂM TRA CẢNH BÁO QUÁ NHIỆT / QUÁ LẠNH
    checkTemperatureAlert(roomId, t);
  }

  // ---- Độ ẩm ----
  if (humidity !== undefined && humidity !== null) {
    const h = Number(humidity);
    const valueEl = document.getElementById(`${roomId}-humidity`);
    const barEl = document.getElementById(`${roomId}-humidity-bar`);
    const statusEl = document.getElementById(`${roomId}-hum-status`);
    const changeWrapperEl = document.getElementById(
      `${roomId}-humidity-change`,
    )?.parentElement;
    const changeIconEl = changeWrapperEl?.querySelector("i");
    const changeValueEl = document.getElementById(`${roomId}-humidity-change`);

    if (valueEl) valueEl.textContent = `${h.toFixed(0)}%`;
    if (barEl)
      barEl.style.width = `${clampPercent(h, HUM_RANGE.min, HUM_RANGE.max)}%`;
    if (statusEl) setStatusBadge(statusEl, humStatusLabel(h));

    if (
      state.prevHum !== null &&
      changeWrapperEl &&
      changeIconEl &&
      changeValueEl
    ) {
      setChangeIndicator(
        changeWrapperEl,
        changeIconEl,
        changeValueEl,
        h - state.prevHum,
        "%",
      );
    }
    state.prevHum = h;
  }

  state.lastReceived = Date.now();
  setEspStatus(roomId, true);

  // Chỉ ghi bảng và lưu Firestore khi có đủ cả nhiệt độ và độ ẩm
  if (temperature !== undefined && humidity !== undefined) {
    updateHistoryTable(roomId, temperature, humidity);
    saveToFirestore(roomId, temperature, humidity);
  }
}

// =====================================================
// 8. LẮNG NGHE REALTIME DATABASE CẢM BIẾN
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
// 9. ĐIỀU KHIỂN ĐÈN
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

  const deviceId = ROOM_CONFIG[roomId]?.deviceId;
  const deviceToggle = deviceId ? document.getElementById(deviceId) : null;
  if (deviceToggle) {
    deviceToggle.checked = isOn;
    const infoSpan = deviceToggle
      .closest(".device-card")
      ?.querySelector(".device-info span");
    if (infoSpan) infoSpan.textContent = isOn ? "Đang sáng" : "Đang tắt";
  }
}

function sendLightCommand(roomId, isOn) {
  const config = ROOM_CONFIG[roomId];
  if (!config || !config.ledPath) return;

  set(ref(database, config.ledPath), isOn).catch((err) => {
    console.error(`Loi ghi den ${roomId}:`, err);
    alert("Không gửi được lệnh. Kiểm tra kết nối mạng.");
  });
}

window.setRoomLight = (roomId, isOn) => sendLightCommand(roomId, isOn);

window.controlDevice = (deviceId, isOn) => {
  const roomId = Object.keys(ROOM_CONFIG).find(
    (id) => ROOM_CONFIG[id].deviceId === deviceId,
  );
  if (roomId) {
    sendLightCommand(roomId, isOn);
  }
};

Object.entries(ROOM_CONFIG).forEach(([roomId, config]) => {
  if (!config.ledPath) return;
  onValue(ref(database, config.ledPath), (snapshot) => {
    const val = snapshot.val();
    updateLightUI(roomId, val === true || val === 1);
  });
});

// =====================================================
// 10. KIỂM TRA MẤT KẾT NỐI (OFFLINE)
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
