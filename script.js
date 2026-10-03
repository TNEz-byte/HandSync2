const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const bandDisplay = document.getElementById('band-display');
const songDisplay = document.getElementById('song-display');

let currentBand = "";

// 1. สร้างตัวเล่นเพลง (Audio Object)
const currentAudio = new Audio();

// 2. รายชื่อเพลงประจำแต่ละวง (ใส่ไฟล์ .mp3 หรือ URL เพลงตัวอย่าง)
// 2. รายชื่อเพลงประจำแต่ละวง
const bandPlaylist = {
  CARABAO: {
    bandName: "คาราบาว (Carabao)",
    songName: "เมดอินไทยแลนด์",
    // เปลี่ยนตรงนี้เป็นพาธไฟล์ mp3 ของคุณได้เลยครับ 👇
    audioUrl: "songs/carabao-edit.mp3" 
  }
};

// ฟังก์ชันสำหรับควบคุมการเล่น/หยุดเพลง
// function playAudio(bandKey) {
//   // ถ้าเป็นวงเดิมกำลังเล่นอยู่ ไม่ต้องเริ่มใหม่
//   if (currentBand === bandKey) return;

//   currentBand = bandKey;

//   if (bandPlaylist[bandKey]) {
//     const songData = bandPlaylist[bandKey];
    
//     // อัปเดตหน้าจอ
//     bandDisplay.innerText = songData.bandName;
//     songDisplay.innerText = `🎵 กำลังเล่น: ${songData.songName}`;

//     // สั่งเล่นเพลง
//     currentAudio.src = songData.audioUrl;
//     currentAudio.play().catch(err => {
//       console.log("Audio Playback Error: คุณต้องกดคลิกหน้าจอก่อน 1 ครั้งเพื่อให้เสียงเล่นได้ (Autoplay Policy)", err);
//     });
//   } else {
//     // กรณีไม่พบวง หรือเอามือลง ให้หยุดเพลง
//     bandDisplay.innerText = "กำลังรอสัญลักษณ์มือ...";
//     songDisplay.innerText = "🎵 -";
    
//     currentAudio.pause();
//     currentAudio.currentTime = 0; // รีเซ็ตเพลงกลับไปเริ่มต้น
//   }
// }

// ฟังก์ชันสำหรับควบคุมการเล่นเพลง (แบบไม่ต้องทำมือค้างไว้)
function playAudio(bandKey) {
  // 1. ถ้าไม่เจอสัญลักษณ์ (UNKNOWN) ให้ข้ามไปเลย เพลงเดิมจะเล่นต่อไปเรื่อยๆ ไม่ถูกสั่งหยุด
  if (bandKey === "UNKNOWN") return;

  // 2. ถ้าเป็นวงเดิมที่กำลังเล่นอยู่แล้ว ก็ให้เล่นต่อตามปกติ ไม่ต้องเริ่มเพลงใหม่
  if (currentBand === bandKey) return;

  // 3. ถ้าเจอสัญลักษณ์วงใหม่ ให้สลับเพลงทันที!
  currentBand = bandKey;

  if (bandPlaylist[bandKey]) {
    const songData = bandPlaylist[bandKey];
    
    // อัปเดตข้อความบนหน้าจอ
    bandDisplay.innerText = songData.bandName;
    songDisplay.innerText = `🎵 กำลังเล่น: ${songData.songName}`;

    // เปลี่ยนไฟล์เพลงและสั่งเล่นทันที
    currentAudio.src = songData.audioUrl;
    currentAudio.currentTime = songData.startTime || 0;
    currentAudio.play().catch(err => {
      console.log("Audio Playback Error:", err);
    });
  }
}

// ฟังก์ชันคำนวณสัญลักษณ์มือ
// function detectGesture(landmarks) {
//   const indexTip = landmarks[8];
//   const middleTip = landmarks[12];
//   const ringTip = landmarks[16];
//   const pinkyTip = landmarks[20];

//   const indexMcp = landmarks[5];
//   const middleMcp = landmarks[9];
//   const ringMcp = landmarks[13];
//   const pinkyMcp = landmarks[17];

//   const isIndexUp = indexTip.y < indexMcp.y;
//   const isPinkyUp = pinkyTip.y < pinkyMcp.y;

//   const isMiddleDown = middleTip.y > middleMcp.y;
//   const isRingDown = ringTip.y > ringMcp.y;

//   // เงื่อนไขสัญลักษณ์ คาราบาว (ชี้ + ก้อย ขึ้น / กลาง + นาง ลง)
//   if (isIndexUp && isPinkyUp && isMiddleDown && isRingDown) {
//     return "CARABAO";
//   }

//   return "UNKNOWN";
// }

// ฟังก์ชันคำนวณสัญลักษณ์มือ (ตรวจจับ: นิ้วโป้ง + นิ้วก้อย)
function detectGesture(landmarks) {
  // พิกัดปลายนิ้วต่างๆ (Tips)
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // พิกัดข้อต่อโคนนิ้ว (MCPs)
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const ringMcp = landmarks[13];
  const pinkyMcp = landmarks[17];

  // 1. ตรวจจับนิ้วก้อย (Pinky) -> ชี้ขึ้น (ค่า Y ปลายนิ้ว ต้องน้อยกว่า ข้อโคนนิ้ว)
  const isPinkyUp = pinkyTip.y < pinkyMcp.y;

  // 2. ตรวจจับนิ้วโป้ง (Thumb) -> กางออกข้าง (เช็กความห่างแกน X ระหว่างปลายนิ้วโป้งกับโคนนิ้วชี้)
  const isThumbOut = Math.abs(thumbTip.x - indexMcp.x) > 0.15;

  // 3. ตรวจจับนิ้วชี้, นิ้วกลาง, นิ้วนาง -> ต้องพับงอลงทั้งหมด
  const isIndexDown = indexTip.y > indexMcp.y;
  const isMiddleDown = middleTip.y > middleMcp.y;
  const isRingDown = ringTip.y > ringMcp.y;

  // เงื่อนไข: โป้งกาง + ก้อยชี้ขึ้น + นิ้วชี้/กลาง/นาง พับงอลง
  if (isThumbOut && isPinkyUp && isIndexDown && isMiddleDown && isRingDown) {
    return "CARABAO"; // หรือเปลี่ยนเป็นชื่อวงที่ต้องการ
  }

  return "UNKNOWN";
}

// ฟังก์ชันประมวลผลแต่ละเฟรมจากกล้อง
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FFCC', lineWidth: 3 });
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0055', lineWidth: 1, radius: 4 });

      const gesture = detectGesture(landmarks);
      playAudio(gesture);
    }
  } else {
    playAudio("UNKNOWN");
  }

  canvasCtx.restore();
}

// ตั้งค่า MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start().catch(err => {
  console.error("ไม่สามารถเปิดกล้องได้:", err);
  alert("กรุณากดอนุญาตให้ใช้งานกล้องเว็บแคม");
});