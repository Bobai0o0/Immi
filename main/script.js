const video = document.getElementById('video');

// 1. Load models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

// 2. Start webcam
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => (video.srcObject = stream))
    .catch(err => console.error("Error accessing webcam:", err));
}

// 3. Detect expressions on each frame
video.addEventListener('play', () => {
  const canvas = document.getElementById('overlay');
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // resize and draw results
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach(d => {
      const { expressions } = d;
      const mood = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
      canvas.getContext('2d').fillText(mood, d.detection.box.x, d.detection.box.y - 10);
    });
  }, 100);
});
