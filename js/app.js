const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause-btn");
const progressBar = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const playIcon = document.getElementById("play-icon");
const vinyl__image = document.getElementById("vinyl__image");
const tone_arm__image = document.getElementById("tone_arm__image");
const tone_arm__image_inner = document.getElementById("tone_arm__image_inner");
const songList = document.getElementById("song-list");
const fileInput = document.getElementById("file-input");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");

const volumeBar = document.getElementById("volume");



// window.onbeforeunload = function() {
//   return "Dude, are you sure you want to leave? Think of the kittens!";
// }

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let analyser, bufferLength, audioCtx, dataArray, currentIndex = 0;
let songs = [];

function initVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
}

function animate() {
  if (!audioCtx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(dataArray);

  const barWidth = canvas.width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i];
    ctx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
    ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
  }

  if (!audio.paused) {
    requestAnimationFrame(animate);
  }
}

fileInput.addEventListener("change", async (event) => {
  console.log('change')
  const files = event.target.files;
  songs = Array.from(files);

  songs.forEach((file, index) => {
    const listItem = document.createElement('div');
    listItem.classList.add('song-item');
    listItem.textContent = file.name;
    listItem.addEventListener('click', () => loadSong(file, index));
    songList.appendChild(listItem);
  });

  if (songs.length > 0) {
    loadSong(songs[0], 0);
  }

});

function loadSong(file, index) {
  console.log('isPlaying', isPlaying)
  currentIndex = index;
  const songItem = document.querySelectorAll('.song-item');
  songItem.forEach(item => item.classList.remove('active'));
  songItem[index].classList.add('active');

  window.jsmediatags.read(file, {
    onSuccess: function(tag) {
      const { title, artist, picture } = tag.tags;
      songTitle.textContent = title || 'Untitled';
      songArtist.textContent = artist || 'Unknown Artist';
      // if (picture) {
      //   const base64String = arrayBufferToBase64(picture.data);
      //   const imageUrl = `data:${picture.format};base64,${base64String}`;
      //   albumCover.src = imageUrl;
      // } else {
      //   albumCover.src = '';
      // }
      audio.src = URL.createObjectURL(file);
      audio.play();
      isPlaying = !isPlaying;
      // startVisualizer();
    },
    onError: function(error) {
      console.error('Error reading tags:', error);
    }
  });
}

audio.addEventListener("play", (e) => {
  initVisualizer();
  animate();
  playIcon.src = "img/pause.svg";
  playIcon.alt = "Play Icon";
  tone_arm__image.classList.add("active");
  tone_arm__image_inner.classList.add("active");
  vinyl__image.classList.add("playing");
});

audio.addEventListener("pause", (e) => {
  playIcon.src = "img/play.svg";
  playIcon.alt = "Play Icon";
  vinyl__image.classList.remove("playing");
  tone_arm__image.classList.remove("active");
  tone_arm__image_inner.classList.remove("active");
});


let isPlaying = false;

playPauseBtn.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    playIcon.src = "img/play.svg";
    playIcon.alt = "Play Icon";
    vinyl__image.classList.remove("playing");
    tone_arm__image.classList.remove("active");
    tone_arm__image_inner.classList.remove("active");
    // albumCover.classList.remove("playing");
  } else {
    audio.play();
    playIcon.src = "img/pause.svg";
    playIcon.alt = "Play Icon";
    tone_arm__image.classList.add("active");
    tone_arm__image_inner.classList.add("active");
    vinyl__image.classList.add("playing");
    // albumCover.classList.add("playing");
  }
  isPlaying = !isPlaying;
});

audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;
  const duration = audio.duration;

  progressBar.value = (currentTime / duration) * 100;
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

progressBar.addEventListener("input", (e) => {
  const duration = audio.duration;
  audio.currentTime = (e.target.value / 100) * duration;
});

volumeBar.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});


function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});



