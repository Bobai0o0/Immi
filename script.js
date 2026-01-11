// =======================
// Element references
// =======================
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const video = document.getElementById('video');
const videoContainer = document.getElementById('video-container');
const welcomeCard = document.getElementById('welcome-card');
const overlay = document.getElementById('overlay');

let stream = null;
let detectionInterval = null;
let displaySize = null;

// =======================
// Load Face API models
// =======================
async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    console.log('✅ Face-api models loaded');
  } catch (err) {
    console.error('❌ Error loading models:', err);
  }
}

// =======================
// Start scanning
// =======================
async function startScanning() {
  // UI swap
  welcomeCard.style.display = 'none';
  videoContainer.style.display = 'block';
  startButton.style.display = 'none';
  stopButton.style.display = 'inline-flex';

  // 🔑 FIX LAYOUT BEFORE VIDEO STARTS
  fixVideoLayout();

  // Start webcam
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    video.srcObject = stream;
  } catch (err) {
    console.error('❌ Webcam error:', err);
    return;
  }
}


  // When video starts playing
  video.addEventListener(
    'play',
    () => {
      // Get displayed video size (NOT camera resolution)
      const rect = video.getBoundingClientRect();

      displaySize = {
        width: rect.width,
        height: rect.height
      };

      // Match canvas size to displayed video
      overlay.width = displaySize.width;
      overlay.height = displaySize.height;
      overlay.style.width = `${displaySize.width}px`;
      overlay.style.height = `${displaySize.height}px`;

      faceapi.matchDimensions(overlay, displaySize);

      // Start detection loop
      detectionInterval = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        faceapi.draw.drawDetections(overlay, resizedDetections);
        faceapi.draw.drawFaceLandmarks(overlay, resizedDetections);
        faceapi.draw.drawFaceExpressions(overlay, resizedDetections);
      }, 100);
    },
    { once: true }
  );


function fixVideoLayout() {
  // Expand the video container
  videoContainer.style.position = 'relative';
  videoContainer.style.overflow = 'visible';
  videoContainer.style.minHeight = '800px';

  // Expand the card holding the video
  const card = videoContainer.closest('.app-card-ui');
  if (card) {
    card.style.overflow = 'visible';
    card.style.minHeight = '900px';
  }

  // Fix flex parent alignment issues
  const contentArea = videoContainer.closest('.app-content-area');
  if (contentArea) {
    contentArea.style.alignItems = 'flex-start';
  }
}

// =======================
// Stop scanning
// =======================
function stopScanning() {
  // UI reset
  videoContainer.style.display = 'none';
  welcomeCard.style.display = 'block';
  startButton.style.display = 'inline-flex';
  stopButton.style.display = 'none';

  // Stop detection loop
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  // Stop webcam
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  // Clear canvas
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);
}

// =======================
// Event listeners
// =======================
startButton.addEventListener('click', startScanning);
stopButton.addEventListener('click', stopScanning);

// =======================
// Init
// =======================
loadModels();

window.addEventListener('resize', () => {
  if (!video || video.paused) return;

  const rect = video.getBoundingClientRect();
  overlay.width = rect.width;
  overlay.height = rect.height;

  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;

  faceapi.matchDimensions(overlay, {
    width: rect.width,
    height: rect.height
  });
});
