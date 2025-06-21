let chars = [..."Laura Mi Amor"];         
let currentCount = 1;
let increasing = true;

// Music Player Variables
let currentPlaylist = 'YourFavs';
let currentSongIndex = 0;
let isPlaying = false;
let audioPlayer = null;
let isLoading = false;

// Updated playlist configuration
const playlists = {
  YourFavs: [
    "YourFavs/Revenge.mp3",
    "YourFavs/Latinas Everywhere (Weke Weke).mp3",
    "YourFavs/Not Even Ghosts Are This Empty.mp3",
    "YourFavs/The Number You Have Dialed Is Not in Service.mp3",
    "YourFavs/Club Bizarre.mp3",
    "YourFavs/Jugador 9.mp3",
    "YourFavs/La Pantera.mp3"
  ],
  ForYou: [
    "ForYou/Smile.mp3",
    "ForYou/Flaws And Sins.mp3",
    "ForYou/She’s The One.mp3",
    "ForYou/Desire.mp3",
    "ForYou/Adore You.mp3",
    "ForYou/999 (Alkaline).mp3",
    "ForYou/I Want It.mp3"
  ]
};

// Storage keys
const JOINT_COUNT_KEY = 'jointCount';
const JOINT_DATE_KEY = 'jointDate';
const JOINT_HISTORY_KEY = 'jointHistory';
const SAVINGS_KEY = 'savingsAmount';
const TARGET_AMOUNT = 10000;

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
  audioPlayer.volume = 0.3;
  document.getElementById('volumeSlider').value = 30;
  
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
  document.getElementById('songTitle').textContent = "Error loading song";
  document.getElementById('songArtist').textContent = "Check file path";
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
  
  // Set the audio source for playback
  const filePath = filename;
  audioPlayer.src = filePath;
  
  // Reset progress
  document.getElementById('progressFillMusic').style.width = '0%';
  document.getElementById('currentTime').textContent = '0:00';
  document.getElementById('totalTime').textContent = '0:00';
  
  // Get clean name from filename (remove .mp3 and replace underscores)
  const songName = filename.replace('.mp3', '').replace(/_/g, ' ');
  
  // --- Set Initial UI State ---
  // Display clean fallback text immediately while metadata loads
  document.getElementById('songTitle').textContent = songName;
  document.getElementById('songArtist').textContent = 'For Laura 💕';
  document.getElementById('albumArt').src = 'default-album.jpg';
  
  // --- Read Metadata ---
  // Check if jsmediatags is available
  if (typeof jsmediatags !== 'undefined') {
    console.log('Attempting to read metadata for:', filePath);
    
    // First, let's check if the audio can actually load
    audioPlayer.addEventListener('loadedmetadata', function onLoadedMetadata() {
      console.log('✅ Audio file loaded successfully');
      audioPlayer.removeEventListener('loadedmetadata', onLoadedMetadata);
      
      // Now try to read metadata
      // For GitHub Pages, we need to ensure the file path is correct
      // Try with both relative and absolute paths
      const tryReadMetadata = (path) => {
        jsmediatags.read(path, {
          onSuccess: function(tag) {
            console.log('✅ Metadata successfully read for:', path);
            const tags = tag.tags;
            
            // Update the page with the metadata from the MP3 file
            document.getElementById('songTitle').textContent = tags.title || songName;
            document.getElementById('songArtist').textContent = tags.artist || 'For Laura 💕';
            
            const albumArt = document.getElementById('albumArt');
            if (tags.picture) {
              try {
                // If album art exists in the metadata, convert it to a format the <img> tag can display
                const { data, format } = tags.picture;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                  base64String += String.fromCharCode(data[i]);
                }
                
                // Clean up previous object URL if using one
                if (albumArt.dataset.objectUrl) {
                  URL.revokeObjectURL(albumArt.dataset.objectUrl);
                  delete albumArt.dataset.objectUrl;
                }
                
                const mimeType = format || 'image/jpeg';
                albumArt.src = `data:${mimeType};base64,${window.btoa(base64String)}`;
                console.log('✅ Album art loaded from metadata');
              } catch (artError) {
                console.log('❌ Error processing album art:', artError);
                albumArt.src = 'default-album.jpg';
              }
            } else {
              console.log('ℹ️ No album art found in metadata');
              albumArt.src = 'default-album.jpg';
            }
            
            // Log additional metadata for debugging
            if (tags.album) console.log('📀 Album:', tags.album);
            if (tags.year) console.log('📅 Year:', tags.year);
            if (tags.genre) console.log('🎵 Genre:', tags.genre);
          },
          onError: function(error) {
            console.log('❌ Could not read metadata for', path, ':', error.type, error.info);
            
            // If relative path failed, try with absolute path
            if (path === filePath && window.location.href.includes('github.io')) {
              const absolutePath = new URL(filePath, window.location.href).href;
              console.log('Trying absolute path:', absolutePath);
              tryReadMetadata(absolutePath);
            } else {
              // Final fallback
              document.getElementById('songTitle').textContent = songName;
              document.getElementById('songArtist').textContent = 'For Laura 💕';
            }
          }
        });
      };
      
      // Start with the relative path
      tryReadMetadata(filePath);
    });
    
    // Handle audio loading errors
    audioPlayer.addEventListener('error', function onError(e) {
      console.log('❌ Audio loading error:', e);
      document.getElementById('songTitle').textContent = songName;
      document.getElementById('songArtist').textContent = 'Check file location';
      audioPlayer.removeEventListener('error', onError);
    });
    
  } else {
    console.error("jsmediatags library not loaded!");
    // Fallback when library not available
    document.getElementById('songTitle').textContent = songName;
    document.getElementById('songArtist').textContent = 'For Laura 💕';
  }
  
  console.log('🎵 Loading song:', filename);
}
// UPDATED: Rewritten playback functions for stability
function togglePlayPause() {
  if (isLoading) return;
  if (!audioPlayer.paused) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  if (!audioPlayer.src || isLoading) return;
  if (audioPlayer.paused) {
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Playback failed:', error);
        isPlaying = false;
        updatePlayButtonState();
      });
    }
  }
}

function pauseMusic() {
  if (!audioPlayer.paused) {
    audioPlayer.pause();
  }
}

function nextSong() {
  const playlist = playlists[currentPlaylist];
  if (!playlist || playlist.length === 0) return;
  
  const wasPlaying = !audioPlayer.paused;
  pauseMusic();

  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong();
  
  if (wasPlaying) {
    audioPlayer.addEventListener('canplay', playMusic, { once: true });
  }
}

function previousSong() {
  const playlist = playlists[currentPlaylist];
  if (!playlist || playlist.length === 0) return;

  const wasPlaying = !audioPlayer.paused;
  pauseMusic();
  
  currentSongIndex = (currentSongIndex === 0) ? playlist.length - 1 : currentSongIndex - 1;
  loadSong();
  
  if (wasPlaying) {
    audioPlayer.addEventListener('canplay', playMusic, { once: true });
  }
}

function switchPlaylist(playlist) {
  if (currentPlaylist === playlist) return;

  const wasPlaying = !audioPlayer.paused;
  pauseMusic();

  currentPlaylist = playlist;
  currentSongIndex = 0;
  
  document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(playlist === 'YourFavs' ? 'yourFavsBtn' : 'forYouBtn').classList.add('active');
  
  loadSong();
  
  if (wasPlaying) {
    audioPlayer.addEventListener('canplay', playMusic, { once: true });
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
  const userInput = document.getElementById("name-input").value.trim().toLowerCase();
  if (userInput === "laura") {
    document.querySelector(".main-body").style.display = "none";
    document.getElementById("hiddenBody").classList.add("active");
    document.body.classList.add("heart-bg");
    document.getElementById("cinnamorollChar").style.display = "block";
    document.getElementById("helloKittyChar").style.display = "block";
    document.getElementById("jointIcon").style.display = "block";
    document.getElementById("savingsIcon").style.display = "block";
    document.getElementById("musicPlayer").style.display = "block";
    initializeJointTracker();
    initializeSavingsTracker();
    initializeMusicPlayer();
    createCelebrationHearts();
  } else {
    showCuteAlert("¿Eres tú?!? 🤔");
  }
}

// Modal functions
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
      setTimeout(() => { sparkle.remove(); }, 2000);
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
      setTimeout(() => { heart.remove(); }, 5000);
    }, i * 200);
  }
}

let lastCheck = 0;

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
    setTimeout(() => { sparkle.remove(); }, 1000);
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('secret-modal') || e.target.classList.contains('history-modal')) {
    e.target.style.display = 'none';
  }
});

const style = document.createElement('style');
style.textContent = `
  @keyframes sparkle {
    0% { opacity: 1; transform: scale(1) rotate(0deg); }
    100% { opacity: 0; transform: scale(1.5) rotate(180deg) translateY(-30px); }
  }
`;
document.head.appendChild(style);