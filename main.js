/************************************************************************
 * ENHANCED GACHA SYSTEM WITH ALL FIXES
 * - FIXED: Semua 6 karakter showcase kembali muncul
 * - FIXED: Mode switching berfungsi normal
 * - FIXED: Background slideshow bekerja
 * - FIXED: Voice system dengan hover preview
 * - ADDED: Horizontal scroll untuk showcase
 * - ADDED: Loading screen
 * - ADDED: Footer
 * - OPTIMIZED: Performa dan memory management
 ************************************************************************/

/* ---------------------- LOADING SYSTEM ---------------------- */
class LoadingSystem {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.loadingText = document.getElementById('loadingText');
    }

    init() {
        this.countAssets();
        this.startLoading();
    }

    countAssets() {
        // Hitung total assets yang perlu diload
        this.totalAssets = 
            document.querySelectorAll('img').length +
            document.querySelectorAll('audio').length +
            5; // Background music tracks
        
        console.log(`Total assets to load: ${this.totalAssets}`);
    }

    startLoading() {
        // Preload critical assets
        this.preloadImages();
        this.setupProgressTracking();
    }

    preloadImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && img.src !== window.location.href) {
                const imageLoader = new Image();
                imageLoader.onload = () => this.assetLoaded();
                imageLoader.onerror = () => this.assetLoaded();
                imageLoader.src = img.src;
            }
        });
    }

    setupProgressTracking() {
        // Simulate progress for better UX
        let simulatedProgress = 0;
        const interval = setInterval(() => {
            simulatedProgress += Math.random() * 10;
            const totalProgress = Math.min(simulatedProgress, 90);
            this.updateProgress(totalProgress, 'Loading assets...');
            
            if (totalProgress >= 90) {
                clearInterval(interval);
                this.finishLoading();
            }
        }, 200);
    }

    assetLoaded() {
        this.loadedAssets++;
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        this.updateProgress(progress, `Loading assets... (${this.loadedAssets}/${this.totalAssets})`);
    }

    updateProgress(percentage, text) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = `${percentage}%`;
        }
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }

    finishLoading() {
        this.updateProgress(100, 'Complete! Starting application...');
        
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            
            // Initialize main systems setelah loading selesai
            if (window.gachaSystem) {
                window.gachaSystem.init();
            }
            
            showNotification('🚀 Application loaded successfully!');
        }, 1000);
    }
}

/* ---------------------- CHARACTER DATA DENGAN VOICE - DIPERBAIKI ---------------------- */
const CHARACTERS = [
  {
    id: 'Sasuke',
    name: 'Sasuke Uchiha',
    rarity: 'Mythic',
    image: '/assets/panels/panel1.png',
    description: 'The Last Uchiha - Rinnegan User',
    file: 'SasukeRinnegan',
    auraColor: '#ffd700',
    voice: '/assets/voices/sasuke_voice.mp3'
  },
  {
    id: 'Obito',
    name: 'Obito Uchiha',
    rarity: 'Legendary',
    image: '/assets/panels/panel2.png',
    description: 'Masked Man - Kamui Master',
    file: 'ObitoUnmasked',
    auraColor: '#9b7bff',
    voice: '/assets/voices/obito_voice.mp3'
  },
  {
    id: 'Madara',
    name: 'Madara Uchiha',
    rarity: 'Supreme',
    image: '/assets/panels/panel3.png',
    description: 'Ghost of Uchiha - Susanoo Warrior',
    file: 'Madara',
    auraColor: '#39d2ff',
    voice: '/assets/voices/madara_voice.mp3'
  },
  {
    id: 'Naruto',
    name: 'Naruto Uzumaki',
    rarity: 'Common',
    image: '/assets/panels/panel4.png',
    description: 'Nine-Tails Jinchuriki - Sage Mode',
    file: 'Naruto',
    auraColor: '#94a6bf',
    voice: '/assets/voices/naruto_voice.mp3'
  },
  {
    id: 'SasukeHebi',
    name: 'Sasuke Hebi',
    rarity: 'Elite',
    image: '/assets/panels/panel5.png',
    description: 'Curse Mark User - Chidori Master',
    file: 'SasukeHebi',
    auraColor: '#39d2ff',
    voice: '/assets/voices/sasukehebi_voice.mp3'
  },
  {
    id: 'BorutoUzumaki',
    name: 'Boruto Uzumaki',
    rarity: 'Legendary',
    image: '/assets/panels/panel6.png',
    description: 'Next Generation - Karma User',
    file: 'BorutoUzumaki',
    auraColor: '#9b7bff',
    voice: '/assets/voices/boruto_voice.mp3'
  }
];

/* ---------------------- MUSIC PLAYER SYSTEM ---------------------- */
class MusicPlayerSystem {
  constructor() {
    this.audio = null;
    this.currentTrack = 0;
    this.isPlaying = false;
    this.hasInteracted = false;
    this.isLoading = false;
    
    this.tracks = [
      '/music.mp3',
      '/music1.mp3', 
      '/music2.mp3',
      '/music3.mp3',
      '/music4.mp3'
    ];
    
    this.trackNames = [
      'Background Music 1',
      'Background Music 2', 
      'Background Music 3',
      'Background Music 4',
      'Background Music 5'
    ];
  }

  init() {
    this.createAudioElement();
    this.setupEventListeners();
    this.loadTrack(0);
    
    // Auto-play dengan user interaction
    const initPlay = () => {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
        if (!this.isPlaying) {
          this.play().catch(e => console.log('Auto-play prevented:', e));
        }
      }
    };

    document.addEventListener('click', initPlay, { once: true });
    document.addEventListener('touchstart', initPlay, { once: true });
  }

  createAudioElement() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';
  }

  setupEventListeners() {
    const playPauseBtn = document.getElementById('playPause');
    const prevMusicBtn = document.getElementById('prevMusic');
    const nextMusicBtn = document.getElementById('nextMusic');
    const musicSelect = document.getElementById('musicSelect');

    playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    prevMusicBtn.addEventListener('click', () => this.previousTrack());
    nextMusicBtn.addEventListener('click', () => this.nextTrack());
    musicSelect.addEventListener('change', (e) => {
      const index = parseInt(e.target.value);
      if (!isNaN(index)) {
        this.selectTrack(index);
      }
    });

    this.audio.addEventListener('loadeddata', () => {
      this.isLoading = false;
      this.updateUI();
    });

    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', this.audio.error);
      this.isLoading = false;
      this.handleAudioError();
    });
  }

  handleAudioError() {
    console.log('Handling audio error, trying next track...');
    this.audio.src = '';
    setTimeout(() => this.nextTrack(), 1000);
  }

  async loadTrack(index) {
    if (this.isLoading) return;
    
    if (index < 0 || index >= this.tracks.length) {
      console.error('Invalid track index:', index);
      return;
    }
    
    try {
      this.isLoading = true;
      
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = '';
      }

      this.currentTrack = index;
      const trackUrl = this.tracks[index];
      
      console.log('Loading track:', trackUrl);
      
      this.audio.src = trackUrl;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      this.audio.load();
      
    } catch (error) {
      console.error('Error loading track:', error);
      this.isLoading = false;
      this.handleAudioError();
    }
  }

  async togglePlayPause() {
    if (this.isLoading) return;
    
    try {
      if (this.isPlaying) {
        await this.pause();
      } else {
        await this.play();
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
    }
  }

  async play() {
    if (!this.audio || !this.audio.src || this.isLoading) {
      return;
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      document.getElementById('playPause').textContent = '⏸️';
      console.log('Audio playing successfully');
      
    } catch (error) {
      console.error('Audio play failed:', error);
      this.isPlaying = false;
      document.getElementById('playPause').textContent = '▶️';
    }
  }

  async pause() {
    try {
      if (this.audio) {
        this.audio.pause();
      }
      this.isPlaying = false;
      document.getElementById('playPause').textContent = '▶️';
    } catch (error) {
      console.error('Pause error:', error);
    }
  }

  nextTrack() {
    if (this.isLoading) return;
    
    const nextIndex = (this.currentTrack + 1) % this.tracks.length;
    console.log('Moving to next track:', nextIndex);
    
    const wasPlaying = this.isPlaying;
    this.loadTrack(nextIndex);
    
    if (wasPlaying) {
      setTimeout(() => this.play(), 1000);
    }
  }

  previousTrack() {
    if (this.isLoading) return;
    
    const prevIndex = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    console.log('Moving to previous track:', prevIndex);
    
    const wasPlaying = this.isPlaying;
    this.loadTrack(prevIndex);
    
    if (wasPlaying) {
      setTimeout(() => this.play(), 1000);
    }
  }

  selectTrack(index) {
    if (this.isLoading || index < 0 || index >= this.tracks.length) return;
    
    console.log('Selected track:', index);
    
    const wasPlaying = this.isPlaying;
    this.loadTrack(index);
    
    if (wasPlaying) {
      setTimeout(() => this.play(), 1000);
    }
  }

  updateUI() {
    try {
      const musicSelect = document.getElementById('musicSelect');
      const musicInfo = document.getElementById('musicInfo');
      
      if (musicSelect && musicInfo) {
        musicSelect.value = this.currentTrack;
        musicInfo.textContent = `Now Playing: ${this.trackNames[this.currentTrack]}`;
      }
    } catch (error) {
      console.error('UI update error:', error);
    }
  }

  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
    }
    this.isPlaying = false;
    this.isLoading = false;
  }
}

/* ---------------------- VOICE SYSTEM ---------------------- */
class VoiceSystem {
  constructor() {
    this.currentVoice = null;
    this.hoverTimeout = null;
  }

  playVoice(voicePath) {
    if (this.currentVoice) {
      this.currentVoice.pause();
      this.currentVoice.currentTime = 0;
      this.currentVoice = null;
    }

    if (!voicePath) {
      console.warn('Invalid voice path');
      return;
    }

    try {
      this.currentVoice = new Audio(voicePath);
      this.currentVoice.volume = 0.7;
      
      this.currentVoice.play().catch(error => {
        console.log('Voice play failed:', error);
      });

      this.currentVoice.addEventListener('ended', () => {
        this.currentVoice = null;
      });

    } catch (error) {
      console.error('Voice system error:', error);
    }
  }

  playHoverPreview(voicePath) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.hoverTimeout = setTimeout(() => {
      this.playVoice(voicePath);
    }, 300);
  }

  stopVoice() {
    if (this.currentVoice) {
      this.currentVoice.pause();
      this.currentVoice.currentTime = 0;
      this.currentVoice = null;
    }
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  cleanup() {
    this.stopVoice();
  }
}

/* ---------------------- FIREWORKS SYSTEM ---------------------- */
class FireworksSystem {
  constructor() {
    this.container = document.body;
  }

  createFirework(x, y, color = '#ffd700') {
    const particles = 50;
    
    for (let i = 0; i < particles; i++) {
      const firework = document.createElement('div');
      firework.className = 'firework';
      firework.style.left = x + 'px';
      firework.style.top = y + 'px';
      firework.style.backgroundColor = color;
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      this.container.appendChild(firework);
      
      let opacity = 1;
      const animate = () => {
        opacity -= 0.02;
        firework.style.opacity = opacity;
        firework.style.transform = `translate(${vx * (1 - opacity) * 50}px, ${vy * (1 - opacity) * 50}px)`;
        
        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          if (firework.parentNode) {
            firework.remove();
          }
        }
      };
      
      animate();
    }
  }

  createFireworksShow(count = 10, duration = 3000) {
    const startTime = Date.now();
    
    const createFireworkBatch = () => {
      if (Date.now() - startTime < duration) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.8;
            const colors = ['#ffd700', '#9b7bff', '#39d2ff', '#ff4444', '#00C851'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.createFirework(x, y, color);
          }, i * 200);
        }
        setTimeout(createFireworkBatch, 500);
      }
    };
    
    createFireworkBatch();
  }

  cleanup() {
    document.querySelectorAll('.firework').forEach(firework => {
      firework.remove();
    });
  }
}

/* ---------------------- STARFIELD SYSTEM ---------------------- */
class StarfieldSystem {
  constructor() {
    this.container = document.getElementById('starfield');
    this.stars = [];
  }

  init() {
    this.createStars();
  }

  createStars() {
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 3 + 2;
      const opacity = Math.random() * 0.7 + 0.3;
      
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.setProperty('--duration', duration + 's');
      star.style.setProperty('--opacity', opacity);
      
      this.container.appendChild(star);
      this.stars.push(star);
    }
  }

  cleanup() {
    this.stars.forEach(star => {
      if (star.parentNode) {
        star.remove();
      }
    });
    this.stars = [];
  }
}

/* ---------------------- SUMMON PORTAL SYSTEM ---------------------- */
class SummonPortalSystem {
  constructor() {
    this.container = document.getElementById('portalGrid');
    this.currentActive = null;
  }

  init() {
    this.createPortalCharacters();
  }

  createPortalCharacters() {
    this.container.innerHTML = '';
    
    CHARACTERS.forEach((character, index) => {
      const characterElement = document.createElement('div');
      characterElement.className = 'portal-character';
      characterElement.dataset.characterId = character.id;
      characterElement.dataset.index = index;
      
      characterElement.innerHTML = `
        <img src="${character.image}" alt="${character.name}" onerror="handleImageError(this)">
      `;
      
      characterElement.addEventListener('click', () => {
        this.activateCharacter(characterElement, character);
      });
      
      this.container.appendChild(characterElement);
    });
  }

  activateCharacter(element, character) {
    document.querySelectorAll('.portal-character').forEach(char => {
      char.classList.remove('active');
    });
    
    element.classList.add('active');
    this.currentActive = character;
    
    window.voiceSystem.playVoice(character.voice);
    
    showNotification(`👁️ Preview: ${character.name} - ${character.rarity}`, 2000);
  }

  deactivateAll() {
    document.querySelectorAll('.portal-character').forEach(char => {
      char.classList.remove('active');
    });
    this.currentActive = null;
  }

  highlightCharacter(characterId) {
    this.deactivateAll();
    const characterElement = this.container.querySelector(`[data-character-id="${characterId}"]`);
    if (characterElement) {
      characterElement.classList.add('active');
      this.currentActive = CHARACTERS.find(char => char.id === characterId);
    }
  }

  getRandomCharacter() {
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }

  async highlightSequence(finalCharacterId, duration = 2000) {
    const characters = document.querySelectorAll('.portal-character');
    const totalHighlights = 20;
    
    for (let i = 0; i < totalHighlights; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      characters[randomIndex].classList.add('active');
      
      await sleep(duration / totalHighlights);
      
      if (i < totalHighlights - 1) {
        characters[randomIndex].classList.remove('active');
      }
    }
    
    this.highlightCharacter(finalCharacterId);
  }

  cleanup() {
    this.deactivateAll();
  }
}

/* ---------------------- SUMMON LIMIT SYSTEM ---------------------- */
class SummonLimitSystem {
  constructor() {
    this.MAX_SUMMONS = 5;
    this.COOLDOWN_DURATION = 24 * 60 * 60 * 1000;
    this.STORAGE_KEYS = {
      SUMMON_COUNT: 'gacha_summon_count',
      LAST_SUMMON_DATE: 'gacha_last_summon_date',
      RESET_TIMESTAMP: 'gacha_reset_timestamp'
    };
    
    this.currentSummons = 0;
    this.resetTime = null;
    this.cooldownInterval = null;
  }

  init() {
    this.loadSummonData();
    this.updateUI();
    this.startCooldownTimer();
  }

  loadSummonData() {
    const today = new Date().toDateString();
    const lastSummonDate = localStorage.getItem(this.STORAGE_KEYS.LAST_SUMMON_DATE);
    
    if (lastSummonDate !== today) {
      this.resetDailyLimits();
      return;
    }

    this.currentSummons = parseInt(localStorage.getItem(this.STORAGE_KEYS.SUMMON_COUNT)) || 0;
    const savedResetTime = localStorage.getItem(this.STORAGE_KEYS.RESET_TIMESTAMP);
    
    if (savedResetTime) {
      this.resetTime = new Date(parseInt(savedResetTime));
    } else {
      this.setResetTime();
    }
  }

  resetDailyLimits() {
    this.currentSummons = 0;
    const today = new Date().toDateString();
    
    localStorage.setItem(this.STORAGE_KEYS.SUMMON_COUNT, '0');
    localStorage.setItem(this.STORAGE_KEYS.LAST_SUMMON_DATE, today);
    this.setResetTime();
    
    console.log('🎯 Daily summon limits reset');
  }

  setResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    this.resetTime = tomorrow;
    localStorage.setItem(this.STORAGE_KEYS.RESET_TIMESTAMP, tomorrow.getTime().toString());
  }

  canSummon() {
    return this.currentSummons < this.MAX_SUMMONS;
  }

  incrementSummon() {
    if (!this.canSummon()) {
      return false;
    }

    this.currentSummons++;
    const today = new Date().toDateString();
    
    localStorage.setItem(this.STORAGE_KEYS.SUMMON_COUNT, this.currentSummons.toString());
    localStorage.setItem(this.STORAGE_KEYS.LAST_SUMMON_DATE, today);
    
    this.updateUI();
    this.showSummonNotification();
    
    return true;
  }

  getRemainingSummons() {
    return this.MAX_SUMMONS - this.currentSummons;
  }

  getTimeUntilReset() {
    const now = new Date();
    const diff = this.resetTime - now;
    
    if (diff <= 0) {
      this.resetDailyLimits();
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }

  updateUI() {
    const limitCounter = document.getElementById('limitCounter');
    const summonsLeft = document.getElementById('summonsLeft');
    const cooldownTimer = document.getElementById('cooldownTimer');
    const summonBtn = document.getElementById('summonBtn');
    const singleSummon = document.getElementById('singleSummon');
    const summonBtnBottom = document.getElementById('summonBtnBottom');
    const singleSummonBottom = document.getElementById('singleSummonBottom');

    if (!limitCounter) return;

    limitCounter.innerHTML = '';
    for (let i = 0; i < this.MAX_SUMMONS; i++) {
      const dot = document.createElement('div');
      dot.className = `limit-dot ${i < this.currentSummons ? 'used' : ''}`;
      limitCounter.appendChild(dot);
    }

    const remaining = this.getRemainingSummons();
    if (summonsLeft) {
      summonsLeft.textContent = remaining;
    }
    
    const canSummon = this.canSummon() && window.securitySystem?.isVerified;
    
    [summonBtn, singleSummon, summonBtnBottom, singleSummonBottom].forEach(btn => {
      if (btn) {
        btn.disabled = !canSummon;
      }
    });

    if (cooldownTimer) {
      if (!this.canSummon()) {
        cooldownTimer.classList.add('show');
      } else {
        cooldownTimer.classList.remove('show');
      }
    }
  }

  startCooldownTimer() {
    this.cooldownInterval = setInterval(() => {
      this.updateCooldownText();
    }, 1000);
  }

  updateCooldownText() {
    const cooldownText = document.getElementById('cooldownText');
    if (!cooldownText) return;
    
    const timeUntilReset = this.getTimeUntilReset();
    
    const formatTime = (time) => time.toString().padStart(2, '0');
    const timeString = `${formatTime(timeUntilReset.hours)}:${formatTime(timeUntilReset.minutes)}:${formatTime(timeUntilReset.seconds)}`;
    
    cooldownText.textContent = `Resets in: ${timeString}`;
    
    if (timeUntilReset.hours === 0 && timeUntilReset.minutes === 0 && timeUntilReset.seconds === 0) {
      this.resetDailyLimits();
      this.updateUI();
      this.showRefreshNotification();
    }
  }

  showSummonNotification() {
    const remaining = this.getRemainingSummons();
    let message = '';
    
    if (remaining === 4) {
      message = '✅ Summon successful! 4 summons remaining today.';
    } else if (remaining === 3) {
      message = '✅ Summon successful! 3 summons remaining today.';
    } else if (remaining === 2) {
      message = '⚠️ 2 summons remaining today. Use them wisely!';
    } else if (remaining === 1) {
      message = '⚠️ Last summon remaining today!';
    } else if (remaining === 0) {
      message = '🎯 Daily limit reached! Come back tomorrow for more summons.';
    }
    
    if (message) {
      showNotification(message);
    }
  }

  showRefreshNotification() {
    const refreshNotification = document.getElementById('refreshNotification');
    if (refreshNotification) {
      refreshNotification.classList.add('show');
      
      setTimeout(() => {
        refreshNotification.classList.remove('show');
      }, 5000);
    }
  }

  cleanup() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}

/* ---------------------- GACHA SYSTEM UTAMA ---------------------- */
class GachaSystem {
  constructor() {
    this.panels = Array.from(document.querySelectorAll('.panel'));
    this.currentActivePanel = null;
    this.summonLimitSystem = new SummonLimitSystem();
    this.summonPortal = new SummonPortalSystem();
    this.voiceSystem = new VoiceSystem();
    this.fireworksSystem = new FireworksSystem();
    this.starfieldSystem = new StarfieldSystem();
  }

  init() {
    this.setupShowcase();
    this.setupGacha();
    this.setupBackground();
    this.preloadHeroImages();
    this.summonLimitSystem.init();
    this.summonPortal.init();
    this.starfieldSystem.init();
  }

  setupGacha() {
    const summonBtn = document.getElementById('summonBtn');
    const singleSummon = document.getElementById('singleSummon');
    const summonBtnBottom = document.getElementById('summonBtnBottom');
    const singleSummonBottom = document.getElementById('singleSummonBottom');
    const claimBtn = document.getElementById('claimBtn');
    const closeResult = document.getElementById('closeResult');
    const modeBtn = document.getElementById('modeBtn');

    if (!summonBtn || !modeBtn) {
      console.error('Required elements not found');
      return;
    }

    // Summon dari portal besar
    summonBtn.addEventListener('click', (e) => {
      if (!this.checkSummonConditions()) return;
      this.performSummon(true);
    });

    singleSummon.addEventListener('click', (e) => {
      if (!this.checkSummonConditions()) return;
      this.performSummon(false);
    });

    // Summon dari bottom board
    summonBtnBottom.addEventListener('click', (e) => {
      if (!this.checkSummonConditions()) return;
      this.performSummon(true);
    });

    singleSummonBottom.addEventListener('click', (e) => {
      if (!this.checkSummonConditions()) return;
      this.performSummon(false);
    });

    claimBtn.addEventListener('click', async () => {
      const filename = claimBtn.dataset.filename;
      if (!filename) {
        showNotification('❌ No file available for download.');
        return;
      }
      await this.secureDownload(filename);
      this.closeResult();
    });

    closeResult.addEventListener('click', () => {
      this.closeResult();
    });

    // Mode switching - FIXED
    let currentMode = 'showcase';
    modeBtn.addEventListener('click', () => {
      currentMode = currentMode === 'showcase' ? 'gacha' : 'showcase';
      modeBtn.textContent = `Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
      this.setMode(currentMode);
    });
  }

  setupShowcase() {
    this.panels.forEach((panel, index) => {
      const characterName = panel.dataset.name;
      const character = CHARACTERS.find(char => char.name === characterName);
      
      if (!character) return;
      
      // Click event untuk select panel
      panel.addEventListener('click', () => {
        this.selectPanel(panel, character);
      });
      
      // Hover event untuk voice preview dan hero image
      panel.addEventListener('mouseenter', () => {
        this.handlePanelHover(panel, character);
      });
      
      panel.addEventListener('mouseleave', () => {
        this.handlePanelHoverEnd();
      });
    });
  }

  selectPanel(panel, character) {
    this.panels.forEach(p => p.classList.remove('active'));
    
    panel.classList.add('active');
    this.currentActivePanel = panel;
    
    this.updateHeroSpot(character);
    
    this.voiceSystem.playVoice(character.voice);
    
    showNotification(`🎭 Selected: ${character.name} - ${character.rarity}`, 2000);
  }

  handlePanelHover(panel, character) {
    this.updateHeroSpot(character);
    
    this.voiceSystem.playHoverPreview(character.voice);
  }

  handlePanelHoverEnd() {
    if (this.currentActivePanel) {
      const characterName = this.currentActivePanel.dataset.name;
      const character = CHARACTERS.find(char => char.name === characterName);
      if (character) {
        this.updateHeroSpot(character);
      }
    }
  }

  updateHeroSpot(character) {
    const heroSpot = document.getElementById('heroSpot');
    const heroImage = document.getElementById('heroImage');
    const heroName = document.getElementById('heroName');
    const heroDesc = document.getElementById('heroDesc');
    
    if (character && character.image) {
      heroImage.src = character.image;
      heroImage.alt = `${character.name} - ${character.rarity}`;
      heroName.textContent = character.name;
      heroDesc.textContent = `${character.rarity} • ${character.description}`;
      heroSpot.classList.add('active');
    } else {
      heroSpot.classList.remove('active');
    }
  }

  checkSummonConditions() {
    if (!window.securitySystem?.isVerified) {
      window.securitySystem.showVerificationModal();
      showNotification('🔒 Subscription required for summoning');
      return false;
    }

    if (!this.summonLimitSystem.canSummon()) {
      showNotification('🎯 Daily summon limit reached! Come back tomorrow.');
      return false;
    }

    return true;
  }

  async performSummon(full = true) {
    const summonBtn = document.getElementById('summonBtn');
    const singleSummon = document.getElementById('singleSummon');
    const summonBtnBottom = document.getElementById('summonBtnBottom');
    const singleSummonBottom = document.getElementById('singleSummonBottom');
    
    const originalText = summonBtn.innerHTML;

    if (!this.summonLimitSystem.canSummon()) {
      showNotification('🎯 Daily summon limit reached!');
      return;
    }

    summonBtn.innerHTML = '<div class="spinner"></div> Loading...';
    summonBtn.disabled = true;
    singleSummon.disabled = true;
    summonBtnBottom.disabled = true;
    singleSummonBottom.disabled = true;

    try {
      const chosenRarity = this.chooseRarity();
      const winnerCharacter = this.pickCharacterByRarity(chosenRarity);
      
      console.log(`🎯 Summon result: ${winnerCharacter.name} (${winnerCharacter.rarity})`);

      await this.summonPortal.highlightSequence(winnerCharacter.id, full ? 2000 : 1500);
      
      await sleep(500);
      
      const summonSuccess = this.summonLimitSystem.incrementSummon();
      if (!summonSuccess) {
        showNotification('❌ Summon failed: Limit reached');
        return;
      }
      
      await this.revealCharacter(winnerCharacter);
      
    } catch (error) {
      console.error('Summon error:', error);
      showNotification('❌ Summon failed. Please try again.');
    } finally {
      summonBtn.innerHTML = 'SUMMON';
      const canSummon = this.summonLimitSystem.canSummon() && window.securitySystem?.isVerified;
      summonBtn.disabled = !canSummon;
      singleSummon.disabled = !canSummon;
      summonBtnBottom.disabled = !canSummon;
      singleSummonBottom.disabled = !canSummon;
    }
  }

  async secureDownload(filename) {
    try {
      showNotification('🔄 Generating secure download link...');
      await sleep(1000);
      
      const downloadUrl = `/mods/${filename}.zip`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filename}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('✅ Download started!');
      return true;
    } catch (error) {
      console.error('Download error:', error);
      showNotification('❌ Download failed. Please try again.');
      return false;
    }
  }

  setupBackground() {
    const bgContainer = document.getElementById('bgContainer');
    const SLIDES = [
      '/assets/backgrounds/bg1.jpg',
      '/assets/backgrounds/bg2.jpg',
      '/assets/backgrounds/bg3.jpg',
      '/assets/backgrounds/bg4.jpg'
    ];

    if (SLIDES.length === 0) return;

    SLIDES.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'bg-slide';
      slide.style.backgroundImage = `url(${src})`;
      if (i === 0) slide.classList.add('active');
      bgContainer.appendChild(slide);
    });

    let idx = 0;
    setInterval(() => {
      const slides = bgContainer.querySelectorAll('.bg-slide');
      if (!slides.length) return;
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 6000);
  }

  preloadHeroImages() {
    this.panels.forEach(panel => {
      const img = panel.querySelector('img');
      if (img && img.src) {
        const preloadImg = new Image();
        preloadImg.src = img.src;
      }
    });
  }

  chooseRarity() {
    const rarityRates = {
      Mythic: 0.02,
      Legendary: 0.08,
      Elite: 0.2,
      Common: 0.7
    };

    const r = Math.random();
    let sum = 0;
    for (const [rarity, rate] of Object.entries(rarityRates)) {
      sum += rate;
      if (r <= sum) return rarity;
    }
    return 'Common';
  }

  pickCharacterByRarity(rarity) {
    const matches = CHARACTERS.filter(char => 
      char.rarity.toLowerCase() === rarity.toLowerCase()
    );
    
    if (matches.length > 0) {
      return matches[Math.floor(Math.random() * matches.length)];
    }
    
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }

  async revealCharacter(character) {
    this.summonPortal.highlightCharacter(character.id);
    
    document.getElementById('resultTitle').textContent = `${character.rarity} • You Obtained ${character.name}`;
    document.getElementById('resultText').textContent = `${character.description} - Secure download ready!`;
    document.getElementById('claimBtn').dataset.filename = character.file;
    
    const resultCharImg = document.getElementById('resultCharImg');
    resultCharImg.src = character.image;
    resultCharImg.alt = `${character.name} - ${character.rarity}`;
    
    const rarityGlow = {
      Mythic: 'rgba(243, 212, 143, 0.4)',
      Legendary: 'rgba(155, 123, 255, 0.4)',
      Elite: 'rgba(57, 210, 255, 0.4)',
      Common: 'rgba(148, 166, 191, 0.4)'
    };
    
    const resultCard = document.querySelector('.result-card');
    resultCard.style.setProperty('--result-glow', rarityGlow[character.rarity] || 'rgba(57,210,255,0.2)');
    
    this.voiceSystem.playVoice(character.voice);
    
    this.fireworksSystem.createFireworksShow(15, 5000);
    
    document.getElementById('resultOverlay').classList.add('open');
    document.getElementById('resultOverlay').setAttribute('aria-hidden', 'false');
  }

  closeResult() {
    document.getElementById('resultOverlay').classList.remove('open');
    document.getElementById('resultOverlay').setAttribute('aria-hidden', 'true');
    this.summonPortal.deactivateAll();
    this.voiceSystem.stopVoice();
  }

  setMode(mode) {
    const showcaseWrap = document.getElementById('showcaseWrap');
    const gachaBoard = document.getElementById('gachaBoard');
    const heroSpot = document.getElementById('heroSpot');
    const summonPortal = document.getElementById('summonPortal');

    if (mode === 'showcase') {
      showcaseWrap.style.display = 'flex';
      gachaBoard.classList.add('hide');
      heroSpot.style.display = 'block';
      summonPortal.classList.add('hide');
    } else {
      showcaseWrap.style.display = 'none';
      gachaBoard.classList.remove('hide');
      heroSpot.style.display = 'none';
      summonPortal.classList.remove('hide');
    }
  }

  cleanup() {
    this.summonLimitSystem.cleanup();
    this.voiceSystem.cleanup();
    this.fireworksSystem.cleanup();
    this.starfieldSystem.cleanup();
    this.summonPortal.cleanup();
  }
}

/* ---------------------- UTILITY FUNCTIONS ---------------------- */
function clamp(v, a=0, b=1){ return Math.max(a, Math.min(b, v)); }
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function handleImageError(img) {
  console.log('Image failed to load:', img.src);
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDgxODI5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMzlkMmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2hhcmFjdGVyIEltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
  img.alt = 'Character image not available';
  
  if (img.id === 'heroImage') {
    img.style.filter = 'grayscale(0.5) brightness(0.7)';
  }
}

function showNotification(message, duration = 3000) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

/* ---------------------- SUBSCRIPTION SECURITY ---------------------- */
class SubscriptionSecurity {
  constructor() {
    this.attempts = 0;
    this.isVerified = false;
  }

  init() {
    this.checkVerification();
    this.updateUI();
    this.setupEventListeners();
  }

  checkVerification() {
    const verified = localStorage.getItem('gacha_sub_verified');
    const sessionStart = localStorage.getItem('gacha_session_start');
    
    if (!verified || !sessionStart) {
      this.isVerified = false;
      return;
    }
    
    const sessionAge = Date.now() - parseInt(sessionStart);
    const SESSION_DURATION = 2 * 60 * 60 * 1000;
    
    this.isVerified = sessionAge < SESSION_DURATION;
  }

  updateUI() {
    const subBadge = document.getElementById('subBadge');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const enableBtn = document.getElementById('enableBtn');

    if (this.isVerified) {
      if (subBadge) subBadge.style.display = 'inline-flex';
      if (statusDot) statusDot.className = 'status-dot verified';
      if (statusText) statusText.textContent = 'Verified ✓';
      if (enableBtn) enableBtn.style.display = 'none';
      
      if (window.gachaSystem?.summonLimitSystem.canSummon()) {
        ['summonBtn', 'singleSummon', 'summonBtnBottom', 'singleSummonBottom'].forEach(id => {
          const btn = document.getElementById(id);
          if (btn) btn.disabled = false;
        });
      }
    } else {
      if (subBadge) subBadge.style.display = 'none';
      if (statusDot) statusDot.className = 'status-dot';
      if (statusText) statusText.textContent = 'Verification Required';
      if (enableBtn) enableBtn.style.display = 'block';
    }
  }

  setupEventListeners() {
    const openChannelBtn = document.getElementById('openChannel');
    const enableBtn = document.getElementById('enableBtn');
    const openYoutubeBtn = document.getElementById('openYoutube');
    const confirmSubscriptionBtn = document.getElementById('confirmSubscription');
    const closeVerificationBtn = document.getElementById('closeVerification');

    if (openChannelBtn) {
      openChannelBtn.addEventListener('click', () => {
        this.showVerificationModal();
      });
    }

    if (enableBtn) {
      enableBtn.addEventListener('click', () => {
        this.showVerificationModal();
      });
    }

    if (openYoutubeBtn) {
      openYoutubeBtn.addEventListener('click', () => {
        this.openYouTubeChannel();
      });
    }

    if (confirmSubscriptionBtn) {
      confirmSubscriptionBtn.addEventListener('click', () => {
        this.verifySubscription();
      });
    }

    if (closeVerificationBtn) {
      closeVerificationBtn.addEventListener('click', () => {
        this.hideVerificationModal();
      });
    }
  }

  showVerificationModal() {
    const modal = document.getElementById('verificationModal');
    if (modal) modal.classList.add('active');
  }

  hideVerificationModal() {
    const modal = document.getElementById('verificationModal');
    if (modal) modal.classList.remove('active');
  }

  openYouTubeChannel() {
    const YT_CHANNEL = 'https://youtube.com/@your-channel';
    window.open(YT_CHANNEL, '_blank');
    
    setTimeout(() => {
      const openYoutubeBtn = document.getElementById('openYoutube');
      const confirmSubscriptionBtn = document.getElementById('confirmSubscription');
      
      if (openYoutubeBtn) openYoutubeBtn.style.display = 'none';
      if (confirmSubscriptionBtn) confirmSubscriptionBtn.style.display = 'block';
    }, 1000);
  }

  verifySubscription() {
    localStorage.setItem('gacha_sub_verified', 'true');
    localStorage.setItem('gacha_session_start', Date.now().toString());
    
    this.isVerified = true;
    this.updateUI();
    this.hideVerificationModal();
    
    showNotification('✅ Subscription verified! Gacha access granted.');
    
    const accessGranted = document.getElementById('accessGranted');
    if (accessGranted) {
      accessGranted.classList.add('show');
      setTimeout(() => {
        accessGranted.classList.remove('show');
      }, 3000);
    }
  }
}

/* ---------------------- GLOBAL CLEANUP ---------------------- */
function cleanupAllSystems() {
  if (window.musicPlayer) {
    window.musicPlayer.cleanup();
  }
  if (window.gachaSystem) {
    window.gachaSystem.cleanup();
  }
  if (window.voiceSystem) {
    window.voiceSystem.cleanup();
  }
}

/* ---------------------- INITIALIZATION ---------------------- */
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.loadingSystem = new LoadingSystem();
    window.loadingSystem.init();

    setTimeout(() => {
      window.voiceSystem = new VoiceSystem();
      window.musicPlayer = new MusicPlayerSystem();
      window.musicPlayer.init();
      window.securitySystem = new SubscriptionSecurity();
      window.securitySystem.init();
      window.gachaSystem = new GachaSystem();
      
      document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => handleImageError(img));
      });

      window.addEventListener('beforeunload', cleanupAllSystems);
      window.addEventListener('pagehide', cleanupAllSystems);

      console.log('🎮 Enhanced Gacha System with All Features Initialized');
    }, 100);

  } catch (error) {
    console.error('Initialization error:', error);
    showNotification('❌ System initialization failed. Please refresh.');
  }
});

// Setup footer event listeners
document.addEventListener('DOMContentLoaded', function() {
  const reportBugLink = document.getElementById('reportBug');
  if (reportBugLink) {
    reportBugLink.addEventListener('click', function(e) {
      e.preventDefault();
      showNotification('🐛 Bug reports: Please create an issue on GitHub!');
    });
  }
});