let chars = [..."Laura Mi Amor"];         
let currentCount = 1;
let increasing = true;

// Music Player Variables
let currentPlaylist = 'YourFavs';
let currentSongIndex = 0;
let isPlaying = false;
let audioPlayer = null;
let isLoading = false;

// Updated playlist configuration - only your 2 songs
const playlists = {
  YourFavs: [
    "Flaws And Sins.mp3"
  ],
  ForYou: [
    "Desire.mp3"
  ]
};

// Storage keys
const JOINT_COUNT_KEY = 'jointCount';
const JOINT_DATE_KEY = 'jointDate';
const JOINT_HISTORY_KEY = 'jointHistory';
const SAVINGS_KEY = 'savingsAmount';
const TARGET_AMOUNT = 10000; // €10,000 target

async function changeTitle() {
  while (true) {
    document.title = "💖 "+chars.slice(0, currentCount).join("")+" 💖";

    await sleep(300);

    if (increasing) {
      if (currentCount >= chars.length) {
        increasing = false;
        currentCount--;
      } else {
        currentCount++;
      }
    } else {
      if (currentCount <= 1) {
        increasing = true;
        currentCount++;
      } else {
        currentCount--;
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

changeTitle();

// Music Player Functions
function initializeMusicPlayer() {
  audioPlayer = document.getElementById('audioPlayer');
  
  // Set initial volume to 30%
  audioPlayer.volume = 0.3;
  document.getElementById('volumeSlider').value = 30;
  
  // Audio event listeners
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', nextSong);
  audioPlayer.addEventListener('loadedmetadata', updateDuration);
  audioPlayer.addEventListener('error', handleAudioError);
  audioPlayer.addEventListener('loadstart', () => {
    isLoading = true;
    updatePlayButtonState();
  });
  audioPlayer.addEventListener('canplay', () => {
    isLoading = false;
    updatePlayButtonState();
  });
  audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButtonState();
    document.getElementById('albumArt').classList.remove('paused');
  });
  audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButtonState();
    document.getElementById('albumArt').classList.add('paused');
  });
  
  // Load first song
  loadSong();
  
  console.log("Music player initialized");
}

function updatePlayButtonState() {
  const playBtn = document.getElementById('playPauseBtn');
  if (isLoading) {
    playBtn.innerHTML = '⏳';
    playBtn.disabled = true;
  } else {
    playBtn.innerHTML = isPlaying ? '⏸' : '▶';
    playBtn.disabled = false;
  }
}

function handleAudioError(e) {
  console.log('Audio error:', e);
  document.getElementById('songTitle').textContent = "Song not found";
  document.getElementById('songArtist').textContent = "Check file location";
  isPlaying = false;
  isLoading = false;
  updatePlayButtonState();
}

function loadSong() {
  const playlist = playlists[currentPlaylist];
  if (!playlist || playlist.length === 0) {
    document.getElementById('songTitle').textContent = "No songs found";
    document.getElementById('songArtist').textContent = "Add MP3 files";
    return;
  }

  const filename = playlist[currentSongIndex];
  if (!filename) return;
  
  // Reset display while loading
  document.getElementById('songTitle').textContent = "Loading...";
  document.getElementById('songArtist').textContent = "...";
  document.getElementById('albumArt').src = 'default-album.jpg';
  
  // Set source
  const filePath = filename;
  audioPlayer.src = filePath;
  
  // Reset progress
  document.getElementById('progressFillMusic').style.width = '0%';
  document.getElementById('currentTime').textContent = '0:00';
  document.getElementById('totalTime').textContent = '0:00';
  
  // First set fallback info from filename
  const songName = filename.replace('.mp3', '');
  
  // Try to read metadata with better error handling
  if (window.jsmediatags && window.jsmediatags.read) {
    console.log('Attempting to read metadata for:', filePath);
    
    window.jsmediatags.read(filePath, {
      onSuccess: function(tag) {
        console.log('Metadata successfully read:', tag);
        const tags = tag.tags;
        
        // Update song info with metadata or fallback
        document.getElementById('songTitle').textContent = tags.title || songName;
        document.getElementById('songArtist').textContent = tags.artist || 'For Laura 💕';
        
        // Handle album art
        const albumArt = document.getElementById('albumArt');
        if (tags.picture && tags.picture.data) {
          try {
            const { data, format } = tags.picture;
            const byteArray = new Uint8Array(data);
            const blob = new Blob([byteArray], { type: format });
            const imageUrl = URL.createObjectURL(blob);
            albumArt.src = imageUrl;
            console.log('Album art loaded successfully');
          } catch (artError) {
            console.log('Error loading album art:', artError);
            albumArt.src = 'default-album.jpg';
          }
        } else {
          albumArt.src = 'default-album.jpg';
        }
        
        // Log additional metadata
        if (tags.album) console.log('Album:', tags.album);
        if (tags.year) console.log('Year:', tags.year);
        if (tags.genre) console.log('Genre:', tags.genre);
      },
      onError: function(error) {
        console.log('Metadata reading failed:', error);
        // Set fallback info
        document.getElementById('songTitle').textContent = songName;
        document.getElementById('songArtist').textContent = 'For Laura 💕';
        document.getElementById('albumArt').src = 'default-album.jpg';
      }
    });
  } else {
    console.log('jsmediatags not available, using fallback');
    // Fallback when library not available
    document.getElementById('songTitle').textContent = songName;
    document.getElementById('songArtist').textContent = 'For Laura 💕';
    document.getElementById('albumArt').src = 'default-album.jpg';
  }
  
  console.log('Loaded song:', filename);
}

function togglePlayPause() {
  if (isLoading) return;
  
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  if (!audioPlayer.src || isLoading) {
    showCuteAlert("No song loaded! 🎵");
    return;
  }

  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Play started successfully
      console.log('Playback started');
    }).catch(error => {
      console.log('Playback failed:', error);
      if (error.name === 'NotAllowedError') {
        showCuteAlert("Click to start music! (Browser needs permission) 🎵");
      } else {
        showCuteAlert("Playback error - check console 🎵");
      }
    });
  }
}

function pauseMusic() {
  audioPlayer.pause();
}

function nextSong() {
  const playlist = playlists[currentPlaylist];
  if (!playlist || playlist.length === 0) return;
  
  const wasPlaying = isPlaying;
  
  // Pause current song
  if (isPlaying) {
    audioPlayer.pause();
  }
  
  // Move to next song
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong();
  
  // Auto-play new song if previous was playing (Spotify behavior)
  if (wasPlaying) {
    // Wait for the song to be ready, then play
    const tryPlay = () => {
      if (audioPlayer.readyState >= 2) { // HAVE_CURRENT_DATA
        playMusic();
      } else {
        // Wait a bit more and try again
        setTimeout(tryPlay, 100);
      }
    };
    setTimeout(tryPlay, 50);
  }
}

function previousSong() {
  const playlist = playlists[currentPlaylist];
  if (!playlist || playlist.length === 0) return;
  
  const wasPlaying = isPlaying;
  
  // Pause current song
  if (isPlaying) {
    audioPlayer.pause();
  }
  
  // Move to previous song
  currentSongIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
  loadSong();
  
  // Auto-play new song if previous was playing (Spotify behavior)
  if (wasPlaying) {
    const tryPlay = () => {
      if (audioPlayer.readyState >= 2) {
        playMusic();
      } else {
        setTimeout(tryPlay, 100);
      }
    };
    setTimeout(tryPlay, 50);
  }
}

function switchPlaylist(playlist) {
  currentPlaylist = playlist;
  currentSongIndex = 0;
  
  // Update button states
  document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(playlist === 'YourFavs' ? 'yourFavsBtn' : 'forYouBtn').classList.add('active');
  
  const wasPlaying = isPlaying;
  
  // Pause current song
  if (isPlaying) {
    audioPlayer.pause();
  }
  
  loadSong();
  
  // Auto-play new song if previous was playing
  if (wasPlaying) {
    const tryPlay = () => {
      if (audioPlayer.readyState >= 2) {
        playMusic();
      } else {
        setTimeout(tryPlay, 100);
      }
    };
    setTimeout(tryPlay, 50);
  }
  
  const playlistName = playlist === 'YourFavs' ? 'Your Favorites' : 'Songs For You';
  showCuteAlert(`Switched to ${playlistName}! 🎵💕`);
}

function setVolume(volume) {
  if (audioPlayer) {
    audioPlayer.volume = volume / 100;
  }
}

function updateProgress() {
  if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById('progressFillMusic').style.width = progress + '%';
    document.getElementById('currentTime').textContent = formatTime(audioPlayer.currentTime);
  }
}

function updateDuration() {
  if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
    document.getElementById('totalTime').textContent = formatTime(audioPlayer.duration);
  }
}

function seekTo(event) {
  if (!audioPlayer.duration) return;
  
  const progressBar = event.currentTarget;
  const clickX = event.offsetX;
  const width = progressBar.offsetWidth;
  const seekTime = (clickX / width) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Joint tracking functions
function initializeJointTracker() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(JOINT_DATE_KEY);
  
  if (savedDate !== today) {
    // New day - save yesterday's count to history and reset
    const yesterdayCount = parseInt(localStorage.getItem(JOINT_COUNT_KEY) || '0');
    if (savedDate && yesterdayCount > 0) {
      saveToHistory(savedDate, yesterdayCount);
    }
    localStorage.setItem(JOINT_COUNT_KEY, '0');
    localStorage.setItem(JOINT_DATE_KEY, today);
  }
  
  updateJointDisplay();
}

function addJoint() {
  const currentCount = parseInt(localStorage.getItem(JOINT_COUNT_KEY) || '0');
  const newCount = currentCount + 1;
  localStorage.setItem(JOINT_COUNT_KEY, newCount.toString());
  updateJointDisplay();
  
  // Cute feedback
  if (newCount === 1) {
    showCuteAlert("First one today! 🍃");
  } else if (newCount === 5) {
    showCuteAlert("Maybe slow down a bit? 💚");
  } else if (newCount >= 10) {
    showCuteAlert("Babe... 🥺💚");
  }
}

function updateJointDisplay() {
  const count = localStorage.getItem(JOINT_COUNT_KEY) || '0';
  document.getElementById('jointCount').textContent = count;
}

function saveToHistory(date, count) {
  const history = JSON.parse(localStorage.getItem(JOINT_HISTORY_KEY) || '[]');
  history.unshift({ date, count });
  // Keep only last 30 days
  if (history.length > 30) {
    history.splice(30);
  }
  localStorage.setItem(JOINT_HISTORY_KEY, JSON.stringify(history));
}

function showJointHistory() {
  const history = JSON.parse(localStorage.getItem(JOINT_HISTORY_KEY) || '[]');
  const historyList = document.getElementById('historyList');
  
  if (history.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No history yet 💚</p>';
  } else {
    historyList.innerHTML = history.map(entry => 
      `<div class="history-item">
        <span>${new Date(entry.date).toLocaleDateString()}</span>
        <span>🍃 ${entry.count}</span>
      </div>`
    ).join('');
  }
  
  document.getElementById('historyModal').style.display = 'flex';
}

function closeHistory() {
  document.getElementById('historyModal').style.display = 'none';
}

// Savings tracking functions
function initializeSavingsTracker() {
  updateSavingsDisplay();
}

function updateSavings(amount) {
  const currentSavings = parseFloat(localStorage.getItem(SAVINGS_KEY) || '0');
  const newSavings = Math.max(0, currentSavings + amount);
  localStorage.setItem(SAVINGS_KEY, newSavings.toString());
  updateSavingsDisplay(amount);
}

// Custom amount button update function
function updateCustomButtons() {
  const amount = parseFloat(document.getElementById('customAmount').value) || 0;
  document.getElementById('customDeductBtn').textContent = `-€${amount}`;
  document.getElementById('customAddBtn').textContent = `+€${amount}`;
}

function customAdd() {
  const amount = parseFloat(document.getElementById('customAmount').value);
  if (amount && amount > 0) {
    updateSavings(amount);
    document.getElementById('customAmount').value = '';
    updateCustomButtons();
  }
}

function customDeduct() {
  const amount = parseFloat(document.getElementById('customAmount').value);
  if (amount && amount > 0) {
    updateSavings(-amount);
    document.getElementById('customAmount').value = '';
    updateCustomButtons();
  }
}

function updateSavingsDisplay(amount) {
  const savings = parseFloat(localStorage.getItem(SAVINGS_KEY) || '0');
  document.getElementById('savingsAmount').textContent = `€${savings.toFixed(0)}`;
  
  const progress = Math.min(100, (savings / TARGET_AMOUNT) * 100);
  document.getElementById('progressFill').style.width = `${progress}%`;
  
  if (progress >= 100) {
    showCuteAlert("TICKET MONEY READY! ✈️🎉💕");
  } else if (amount && amount > 0) {
    showCuteAlert(`+€${amount}! Getting closer! ✈️💕`);
  } else if (amount && amount < 0) {
    showCuteAlert(`€${Math.abs(amount)} spent 💸`);
  }
}

function showCuteAlert(message) {
  const alert = document.createElement('div');
  alert.className = 'cute-alert';
  alert.innerHTML = `${message} 🥺💕`;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 2000);
}

function CheckIfRight(event) {
  event.preventDefault();

  const userInput = document
    .getElementById("name-input")
    .value
    .trim()
    .toLowerCase();

  if (userInput === "laura") {
    document.querySelector(".main-body").style.display = "none";
    document.getElementById("hiddenBody").classList.add("active");
    document.body.classList.add("heart-bg");
    
    // Show all hidden elements
    document.getElementById("cinnamorollChar").style.display = "block";
    document.getElementById("helloKittyChar").style.display = "block";
    document.getElementById("jointIcon").style.display = "block";
    document.getElementById("savingsIcon").style.display = "block";
    document.getElementById("musicPlayer").style.display = "block";
    
    // Initialize trackers and music player
    initializeJointTracker();
    initializeSavingsTracker();
    initializeMusicPlayer();
    
    // Add the large heart background
    const heartBg = document.createElement('div');
    heartBg.className = 'love-heart';
    document.body.appendChild(heartBg);
    
    // Add some celebration hearts
    createCelebrationHearts();
  } else {
    showCuteAlert("¿Eres tú?!? 🤔");
  }
}

// Tracker modal functions
function openJointTracker() {
  document.getElementById('jointModal').style.display = 'flex';
  createMagicalSparkles('🍃', '#4a7c59');
  showCuteAlert("Joint tracker opened! 🍃💚");
}

function openSavingsTracker() {
  document.getElementById('savingsModal').style.display = 'flex';
  createMagicalSparkles('💰', '#2d5a2d');
  showCuteAlert("Savings tracker opened! 💰✈️");
}

// Secret Easter Egg Functions
function openCinnamorollSecret() {
  document.getElementById('cinnamorollModal').style.display = 'flex';
  createMagicalSparkles('🐰', '#87CEEB');
  showCuteAlert("¡Found your sweet bunny! 🐰✨");
}

function openHelloKittySecret() {
  document.getElementById('helloKittyModal').style.display = 'flex';
  createMagicalSparkles('🎀', '#FFB6C1');
  showCuteAlert("¡Hello gorgeous! 🎀💖");
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function createMagicalSparkles(emoji, color) {
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.innerHTML = emoji;
      sparkle.style.position = 'absolute';
      sparkle.style.left = Math.random() * 100 + 'vw';
      sparkle.style.top = Math.random() * 100 + 'vh';
      sparkle.style.fontSize = (Math.random() * 20 + 15) + 'px';
      sparkle.style.zIndex = '9999';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.filter = `drop-shadow(0 0 10px ${color})`;
      sparkle.style.animation = `twinkle 2s ease-out forwards`;
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.remove();
      }, 2000);
    }, i * 100);
  }
}

function createCelebrationHearts() {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.innerHTML = ['💕', '💖', '💗', '💝', '💘'][Math.floor(Math.random() * 5)];
      heart.style.position = 'absolute';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.top = '100vh';
      heart.style.fontSize = (Math.random() * 30 + 20) + 'px';
      heart.style.zIndex = '1000';
      heart.style.pointerEvents = 'none';
      heart.style.animation = `float ${3 + Math.random() * 2}s ease-out forwards`;
      
      document.body.appendChild(heart);
      
      setTimeout(() => {
        heart.remove();
      }, 5000);
    }, i * 200);
  }
}

let lastCheck = 0;

// Add some interactive sparkles on mouse move
document.addEventListener('mousemove', (e) => {
  if (Math.random() < 0.1) {
    const now = Date.now();
    if (now - lastCheck < 33) return;
    lastCheck = now;
    const sparkle = document.createElement('div');
    sparkle.innerHTML = ['💕', '💖', '💗', '💝', '💘'][Math.floor(Math.random() * 5)];
    sparkle.style.position = 'absolute';
    sparkle.style.left = e.clientX + 'px';
    sparkle.style.top = e.clientY + 'px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.fontSize = '20px';
    sparkle.style.zIndex = '999';
    sparkle.style.animation = 'sparkle 1s ease-out forwards';
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('secret-modal')) {
    e.target.style.display = 'none';
  }
  if (e.target.classList.contains('history-modal')) {
    e.target.style.display = 'none';
  }
});

// Add sparkle animation keyframe for mouse sparkles
const style = document.createElement('style');
style.textContent = `
  @keyframes sparkle {
    0% { 
      opacity: 1; 
      transform: scale(1) rotate(0deg); 
    }
    100% { 
      opacity: 0; 
      transform: scale(1.5) rotate(180deg) translateY(-30px); 
    }
  }
`;
document.head.appendChild(style);