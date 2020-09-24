const VIDEO_WIDTH = 500;
const VIDEO_HEIGHT = 500;
let loadStatus = false;
let left = document.getElementById("left");
let right = document.getElementById("right");
let up = document.getElementById("up");
let down = document.getElementById("down");
let leftGesture = undefined;
let rightGesture = undefined;
let upGesture = undefined;
let downGesture = undefined;
let predictions = undefined;

const upEvent = new Event('up');
const downEvent = new Event('down');
const leftEvent = new Event('left');
const rightEvent = new Event('right');
const loadedEvent = new Event('model loaded');

const similarity = require('compute-cosine-similarity');

function cosineDistanceMatching(poseVector1, poseVector2) {
    if (!poseVector1 || !poseVector2) {
        return 1;
    }
    let cosineSimilarity = similarity(poseVector1, poseVector2);
    let distance = 2 * (1 - cosineSimilarity);
    return Math.sqrt(distance);
}

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

const main = async () => {
    let video;
    try {
        video = await loadVideo();
    } catch (e) {
        throw new Error('Failed to load handpose model')
    }

    landmarksRealTime(video);
}

const landmarksRealTime = async (video) => {
    const model = await handpose.load();
    if (!loadStatus) {
        loadStatus = true;
        window.dispatchEvent(loadedEvent);
    }
    video.width = VIDEO_WIDTH;
    video.height = VIDEO_HEIGHT;

    async function frameLandmarks() {
        predictions = await model.estimateHands(video);
        if (predictions.length > 0) {

            const keypoints = predictions[0].landmarks;

            const gesture = []
            for (let i = 0; i < keypoints.length; i++) {
                gesture.push(keypoints[i][0])
                gesture.push(keypoints[i][1])
            }

            try {
                if (cosineDistanceMatching(gesture, leftGesture) < 0.1) {
                    window.dispatchEvent(leftEvent);
                    left.style.borderColor = "red";
                    right.style.borderColor = "white";
                    down.style.borderColor = "white";
                    up.style.borderColor = "white";
                } else if (cosineDistanceMatching(gesture, rightGesture) < 0.1) {
                    window.dispatchEvent(rightEvent);
                    left.style.borderColor = "white";
                    right.style.borderColor = "red";
                    down.style.borderColor = "white";
                    up.style.borderColor = "white";
                } else if (cosineDistanceMatching(gesture, downGesture) < 0.1) {
                    window.dispatchEvent(downEvent);
                    left.style.borderColor = "white";
                    right.style.borderColor = "white";
                    down.style.borderColor = "red";
                    up.style.borderColor = "white";
                } else if (cosineDistanceMatching(gesture, upGesture) < 0.1) {
                    window.dispatchEvent(upEvent);
                    left.style.borderColor = "white";
                    right.style.borderColor = "white";
                    down.style.borderColor = "white";
                    up.style.borderColor = "red";
                }
            } catch (e) {
                console.log(err)
            }
        }
        requestAnimationFrame(frameLandmarks);
    };

    frameLandmarks();
};
main();

function takepicture(element) {
    let canvas = document.getElementById("control")
    let context = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    context.drawImage(video, 0, 0, 100, 100);
    element.setAttribute('src', canvas.toDataURL('image/png'));
}

left.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            leftGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                leftGesture.push(predictions[0].landmarks[i][0])
                leftGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(left)
        }
    }
})
right.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            rightGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                rightGesture.push(predictions[0].landmarks[i][0])
                rightGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(right)
        }
    }
})
down.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            downGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                downGesture.push(predictions[0].landmarks[i][0])
                downGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(down)
        }
    }
})
up.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            upGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                upGesture.push(predictions[0].landmarks[i][0])
                upGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(up)
        }
    }
})

