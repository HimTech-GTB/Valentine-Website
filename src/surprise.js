// surprise.js - Receiver Surprise Mode Controller

let supabaseClient = null;
let isDemoMode = false;
let projectSlug = "";
let projectData = null;

// Audio controls
const audioEl = document.getElementById("romantic-music");
const btnMusicToggle = document.getElementById("btn-music-toggle");
const volumePanel = document.getElementById("music-volume-panel");
const volumeSlider = document.getElementById("music-volume");

// DOM elements
const particlesContainer = document.getElementById("particles-container");
const toastContainer = document.getElementById("toast-container");
const lockScreen = document.getElementById("lock-screen");
const pinInputs = document.querySelectorAll(".pin-box");
const pinFeedback = document.getElementById("pin-feedback");
const surpriseContent = document.getElementById("surprise-content");
const unlockedSurprise = document.getElementById("unlocked-surprise");

// Proposal elements
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const flirtyNoMsg = document.getElementById("flirty-no-msg");
const partnerDisplayName = document.getElementById("partner-display-name");
const proposalPartnerTitle = document.getElementById("proposal-partner-title");
const proposalCustomMsg = document.getElementById("proposal-custom-msg");

// Mirror elements
const videoEl = document.getElementById("mirror-video");
const canvasEl = document.getElementById("mirror-canvas");
const mirrorFallback = document.getElementById("mirror-fallback");
const mirrorLoader = document.getElementById("mirror-loader");
const btnCapture = document.getElementById("btn-capture");
const btnMirrorRetry = document.getElementById("btn-mirror-retry");

// Gallery elements
const slideImg = document.getElementById("gallery-slide-img");
const slideCaption = document.getElementById("gallery-slide-caption");
const slideReactionBadge = document.getElementById("slide-reaction-badge");
const galleryDots = document.getElementById("gallery-dots");
const galleryCommentInput = document.getElementById("gallery-comment-input");
const btnGalleryCommentSubmit = document.getElementById("btn-gallery-comment-submit");
const loveCardsListContainer = document.getElementById("love-cards-list-container");

// Timeline & Dreams
const timelineScrollFeed = document.getElementById("timeline-scroll-feed");
const dreamsGridFeed = document.getElementById("dreams-grid-feed");

// Gift boxes
const giftBoxesGrid = document.getElementById("gift-boxes-grid");

// Countdown
const timerDays = document.getElementById("timer-days");
const timerHours = document.getElementById("timer-hours");
const timerMinutes = document.getElementById("timer-minutes");

// Envelope
const envelopeWrapper = document.getElementById("envelope-wrapper");
const envelopeFlap = document.getElementById("envelope-flap");
const envelopeWaxSeal = document.getElementById("envelope-wax-seal");
const envelopeLetter = document.getElementById("envelope-letter");
const loveLetterDisplayBody = document.getElementById("love-letter-display-body");

// Games tabs
const gameTabCatch = document.getElementById("game-tab-catch");
const gameTabQuiz = document.getElementById("game-tab-quiz");
const gameTabMatch = document.getElementById("game-tab-match");
const gamePanes = document.querySelectorAll(".game-pane");

// Heart Catch Game elements
const catchCanvas = document.getElementById("heart-catch-canvas");
const catchScoreEl = document.getElementById("catch-score");
const catchHighScoreMsg = document.getElementById("catch-high-score-msg");
const btnStartCatch = document.getElementById("btn-start-catch");
const catchOverlay = document.getElementById("game-catch-overlay");

// Love Quiz elements
const quizQuestionBox = document.getElementById("quiz-question-box");
const quizCurrIdx = document.getElementById("quiz-curr-idx");
const quizTotalCnt = document.getElementById("quiz-total-cnt");
const quizScoreEl = document.getElementById("quiz-score");

// Memory Match elements
const memoryCardsGrid = document.getElementById("memory-cards-grid");
const memoryMatchWinMsg = document.getElementById("memory-match-win-msg");

// Feedback elements
const feedbackInput = document.getElementById("feedback-message-input");
const btnFeedbackSubmit = document.getElementById("btn-feedback-submit");

// State values
let pinCode = "";
let yesBtnScale = 1;
let flirtyNoIndex = 0;
const flirtyNoPhrases = [
  "No? Are you sure? 🥺",
  "My heart says yes already ❤️",
  "Try again, beautiful 😘",
  "Think about us again 💕",
  "You cannot click this! 🥰",
  "Give me a chance! 🌹",
  "Oops, missed me! 😜"
];

// Slideshow state
let currentSlideIndex = 0;
let slideInterval = null;

// Heart Catch Game states
let catchContext = null;
let basketX = 150;
let basketWidth = 60;
let basketHeight = 15;
let fallingHearts = [];
let catchScore = 0;
let catchGameRunning = false;

// Quiz states
let quizIndex = 0;
let quizScore = 0;

// Memory match states
let selectedCards = [];
let memoryMatches = 0;

// Init surprise page
window.addEventListener("DOMContentLoaded", async () => {
  initParticles();
  setupPinShifter();
  setupMusicControls();
  setupProposalNoButton();
  setupEnvelopeAnimation();
  setupGamesTabs();
  
  // Extract URL parameters
  const params = new URLSearchParams(window.location.search);
  projectSlug = params.get("s") || "";
  isDemoMode = params.get("demo") === "true";

  if (!projectSlug) {
    showToast("Invalid surprise link format. Missing slug.", "error");
    pinFeedback.innerText = "Error: Invalid link.";
    return;
  }

  await initBackend();
  
  // Create icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Particles background
function initParticles() {
  setInterval(() => {
    if (document.hidden) return;
    const heart = document.createElement("div");
    heart.className = "heart-particle text-love-200/40 select-none pointer-events-none";
    heart.innerHTML = ["❤️", "💖", "🌸", "💕"][Math.floor(Math.random() * 4)];
    
    const size = Math.random() * 20 + 12;
    heart.style.fontSize = `${size}px`;
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.setProperty("--tx", `${(Math.random() - 0.5) * 200}px`);
    heart.style.setProperty("--scale", Math.random() * 0.8 + 0.6);
    heart.style.setProperty("--rot", `${Math.random() * 180 - 90}deg`);
    heart.style.animationDuration = `${Math.random() * 3 + 4}s`;

    particlesContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }, 900);
}

// Toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `love-toast max-w-sm w-full bg-white border-l-4 shadow-xl rounded-xl p-4 flex items-center gap-3 border-love-500`;
  
  if (type === "error") {
    toast.className = toast.className.replace("border-love-500", "border-red-500");
  }
  
  toast.innerHTML = `
    <div class="p-1 rounded-full ${type === 'error' ? 'bg-red-50 text-red-500' : 'bg-love-50 text-love-500 animate-heartbeat'}">
      <i data-lucide="${type === 'error' ? 'alert-triangle' : 'heart'}" class="w-5 h-5"></i>
    </div>
    <div class="flex-1">
      <p class="text-xs font-semibold text-slate-800">${message}</p>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons();
  }
  setTimeout(() => toast.remove(), 5000);
}

// Initialise Backend Client
async function initBackend() {
  if (isDemoMode) {
    console.log("Receiver mode: operating on Local Sandbox Database.");
    return;
  }

  const ENV_URL = import.meta.env?.VITE_SUPABASE_URL || "";
  const ENV_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";
  
  if (ENV_URL && ENV_KEY) {
    supabaseClient = window.supabase.createClient(ENV_URL, ENV_KEY);
    return;
  }

  const savedConfig = localStorage.getItem("supabase_config");
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    supabaseClient = window.supabase.createClient(config.url, config.key);
  } else {
    isDemoMode = true; // Fallback
    console.warn("No Supabase configuration found. Falling back to local demo mock.");
  }
}

// Shifting focuses inside PIN inputs
function setupPinShifter() {
  pinInputs.forEach((input, index) => {
    // Focus next on type
    input.addEventListener("input", (e) => {
      if (input.value.length === 1 && index < 3) {
        pinInputs[index + 1].focus();
      }
      checkPinCompletion();
    });

    // Handle backspace focus previous
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
        pinInputs[index - 1].focus();
      }
    });
  });
}

// Check if pin is fully entered
async function checkPinCompletion() {
  pinCode = Array.from(pinInputs).map(i => i.value).join("");
  if (pinCode.length === 4) {
    await verifyPinCode();
  }
}

// Verify PIN Code via RPC or Mock
async function verifyPinCode() {
  pinFeedback.className = "text-xs font-semibold text-slate-400 animate-pulse";
  pinFeedback.innerText = "Unlocking surprise memories...";

  try {
    if (isDemoMode) {
      // Mock lookup
      const mockProjects = JSON.parse(localStorage.getItem("mock_projects") || "[]");
      const matched = mockProjects.find(p => p.slug === projectSlug && p.pin === pinCode);
      if (matched) {
        projectData = matched;
        onUnlockSuccess();
      } else {
        onUnlockFail();
      }
    } else {
      // Supabase RPC
      const { data, error } = await supabaseClient.rpc("get_project_details", {
        p_slug: projectSlug,
        p_pin: pinCode
      });
      if (error) throw error;
      
      // Since returns table, it will be array of 1 object
      if (data && data.length > 0) {
        projectData = data[0];
        onUnlockSuccess();
      } else {
        onUnlockFail();
      }
    }
  } catch (err) {
    pinFeedback.innerText = "Error: " + err.message;
  }
}

function onUnlockFail() {
  pinFeedback.className = "text-xs font-semibold text-love-500 animate-bounce";
  const playfulErrs = [
    "Oops 😘 That's not our secret.",
    "Try again, beautiful ❤️",
    "Think about us again 💕",
    "Wrong PIN, sweetheart! 🥰"
  ];
  pinFeedback.innerText = playfulErrs[Math.floor(Math.random() * playfulErrs.length)];
  
  // Shake animation
  const container = document.getElementById("pin-inputs-container");
  container.classList.add("animate-pulse");
  setTimeout(() => container.classList.remove("animate-pulse"), 500);

  // Clear inputs
  pinInputs.forEach(input => {
    input.value = "";
  });
  pinInputs[0].focus();
}

function onUnlockSuccess() {
  lockScreen.classList.add("hidden");
  surpriseContent.classList.remove("hidden");
  
  // Setup Proposal Scene Details
  partnerDisplayName.innerText = projectData.partner_name;
  if (projectData.proposal_title) {
    proposalPartnerTitle.innerHTML = `${projectData.proposal_title} <span class="text-love-500">${projectData.nickname || projectData.partner_name}</span>? ❤️`;
  }
  if (projectData.proposal_message) {
    proposalCustomMsg.innerText = projectData.proposal_message;
  }

  // Pre-load music
  if (projectData.music_url) {
    audioEl.querySelector("source").src = projectData.music_url;
    audioEl.load();
  }

  // Try to play music on unlock
  audioEl.play().then(() => {
    btnMusicToggle.querySelector("i").setAttribute("data-lucide", "music");
  }).catch(() => {
    // Autoplay blocked fallback
    console.log("Music autoplay blocked, waiting for interact.");
  });

  // Populate Letter Display
  loveLetterDisplayBody.innerText = projectData.love_letter || "I love you forever.";

  // Populate sub-tables
  buildLoveJourneyFeed();
  buildTimelineFeed();
  buildDreamsFeed();
  buildQuizGame();
  buildMemoryMatchGame();
  buildGiftBoxes();
  startCountdownTimer();
}

// Background Music Volume
function setupMusicControls() {
  btnMusicToggle.addEventListener("click", () => {
    if (audioEl.paused) {
      audioEl.play();
      btnMusicToggle.querySelector("i").setAttribute("data-lucide", "music");
      volumePanel.classList.remove("hidden");
      volumePanel.classList.add("flex");
    } else {
      audioEl.pause();
      btnMusicToggle.querySelector("i").setAttribute("data-lucide", "music-4");
      volumePanel.classList.add("hidden");
      volumePanel.classList.remove("flex");
    }
    if (window.lucide) window.lucide.createIcons();
  });

  volumeSlider.addEventListener("input", (e) => {
    audioEl.volume = e.target.value;
  });
}

// Proposal Yes / No logic
function setupProposalNoButton() {
  btnNo.addEventListener("click", handleNoClick);
  btnNo.addEventListener("mouseover", handleNoClick);

  btnYes.addEventListener("click", () => {
    showToast("Yay! I love you too! ❤️");
    
    // Unlock surprises
    unlockedSurprise.classList.remove("hidden");
    
    // Smooth scroll down
    document.getElementById("scene-mirror").scrollIntoView({ behavior: "smooth" });

    // Play fireworks
    startFireworks();

    // Try starting camera stream
    initCameraStream();
  });
}

function handleNoClick() {
  // Grow YES button
  yesBtnScale += 0.15;
  btnYes.style.transform = `scale(${yesBtnScale})`;
  
  // Show flirty phrases
  flirtyNoMsg.innerText = flirtyNoPhrases[flirtyNoIndex];
  flirtyNoIndex = (flirtyNoIndex + 1) % flirtyNoPhrases.length;

  // Reposition NO button within container bounds
  const container = document.getElementById("proposal-btns-container");
  const rect = container.getBoundingClientRect();
  
  const randomX = Math.random() * (rect.width - 120);
  const randomY = Math.random() * (rect.height - 50);

  btnNo.style.position = "absolute";
  btnNo.style.left = `${randomX}px`;
  btnNo.style.top = `${randomY}px`;
}

// Camera mirror snapshots
async function initCameraStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    videoEl.srcObject = stream;
    videoEl.onloadedmetadata = () => {
      mirrorLoader.classList.add("hidden");
    };
    
    btnCapture.onclick = () => takeWebcamSnapshot(stream);
  } catch (err) {
    console.error("Camera access failed:", err);
    mirrorLoader.classList.add("hidden");
    mirrorFallback.classList.remove("hidden");
  }
}

async function takeWebcamSnapshot(stream) {
  // Play camera sound
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}

  // Draw to canvas
  const context = canvasEl.getContext("2d");
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  
  // Flip image horizontally
  context.translate(canvasEl.width, 0);
  context.scale(-1, 1);
  context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
  
  const dataUrl = canvasEl.toDataURL("image/jpeg");
  showToast("Uploading your beautiful picture... ❤️");

  // Save to DB
  try {
    if (isDemoMode) {
      const allMockCaptured = JSON.parse(localStorage.getItem("mock_captured_images") || "[]");
      allMockCaptured.push({
        id: crypto.randomUUID(),
        project_id: projectData.id,
        image_url: dataUrl,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("mock_captured_images", JSON.stringify(allMockCaptured));
    } else {
      // 1. Upload base64 blob to storage
      const blob = await (await fetch(dataUrl)).blob();
      const filePath = `captured/${projectData.id}/${Date.now()}.jpg`;
      const { error: uploadErr } = await supabaseClient.storage
        .from("captured-images")
        .upload(filePath, blob, { contentType: "image/jpeg" });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabaseClient.storage.from("captured-images").getPublicUrl(filePath);
      
      // 2. Insert to captured_images
      const { error } = await supabaseClient.from("captured_images").insert({
        project_id: projectData.id,
        image_url: publicUrl
      });
      if (error) throw error;
    }
    
    // Display romantic Toast
    showToast("You are so pretty, that's why I loved you ❤️");
    
    // Stop camera
    stream.getTracks().forEach(t => t.stop());
    videoEl.classList.add("hidden");
    canvasEl.classList.remove("hidden");
    btnCapture.disabled = true;
    btnCapture.innerText = "Captured Successfully! ❤️";
    btnCapture.className = btnCapture.className.replace("from-gold-500 to-gold-600", "from-green-500 to-green-600 text-white");
  } catch (err) {
    showToast("Failed to upload snapshot: " + err.message, "error");
  }
}

// Memory slides & custom cards replies
function buildLoveJourneyFeed() {
  const gallery = projectData.gallery || [];
  
  if (gallery.length === 0) {
    document.getElementById("scene-gallery").classList.add("hidden");
    return;
  }

  // Populate slides
  changeSlideshowImage();
  slideInterval = setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % gallery.length;
    changeSlideshowImage();
  }, 5000);

  // Setup slideshow dots
  galleryDots.innerHTML = "";
  gallery.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.className = `w-2 h-2 rounded-full bg-slate-300 transition cursor-pointer`;
    if (idx === 0) dot.className += " bg-love-500 w-4";
    dot.onclick = () => {
      currentSlideIndex = idx;
      changeSlideshowImage();
      resetSlideshowTimer();
    };
    galleryDots.appendChild(dot);
  });

  // Reaction buttons click
  const reactionBtns = document.querySelectorAll(".reaction-emoji-btn");
  reactionBtns.forEach(btn => {
    btn.onclick = async () => {
      const emoji = btn.getAttribute("data-emoji");
      await submitInteraction("gallery_image", gallery[currentSlideIndex].id, emoji, null);
    };
  });

  // Text comment submit
  btnGalleryCommentSubmit.onclick = async () => {
    const reply = galleryCommentInput.value.trim();
    if (!reply) return;
    await submitInteraction("gallery_image", gallery[currentSlideIndex].id, null, reply);
    galleryCommentInput.value = "";
  };

  // Populate Love Cards list (Descriptions details)
  loveCardsListContainer.innerHTML = "";
  const cards = projectData.messages || [];
  cards.forEach((c) => {
    const cardEl = document.createElement("div");
    cardEl.className = "glass-panel p-5 rounded-2xl shadow-sm border space-y-3 relative overflow-hidden";
    
    // Layout template
    cardEl.innerHTML = `
      <h4 class="text-base font-bold text-slate-800">${c.title}</h4>
      <p class="text-xs text-slate-600 leading-relaxed font-medium">${c.message}</p>
      
      <!-- Reactions overlay for each love message card -->
      <div class="border-t border-love-100/50 pt-2 flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <div class="flex gap-1.5">
            <button class="love-msg-react-btn text-lg hover:scale-125 transition cursor-pointer" data-emoji="❤️">❤️</button>
            <button class="love-msg-react-btn text-lg hover:scale-125 transition cursor-pointer" data-emoji="😍">😍</button>
            <button class="love-msg-react-btn text-lg hover:scale-125 transition cursor-pointer" data-emoji="😘">😘</button>
            <button class="love-msg-react-btn text-lg hover:scale-125 transition cursor-pointer" data-emoji="😊">😊</button>
          </div>
          <!-- Corner replies indicator -->
          <div class="reactions-badge-tag text-[10px] font-bold text-love-500 bg-love-50 px-2 py-0.5 rounded-full border border-love-100 hidden"></div>
        </div>
        <div class="flex gap-2">
          <input type="text" placeholder="Write reply..." class="love-msg-comment-input flex-1 px-3 py-1.5 text-[10px] rounded-xl glass-input">
          <button class="love-msg-comment-submit px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold transition cursor-pointer">Submit</button>
        </div>
      </div>
    `;

    // React buttons
    cardEl.querySelectorAll(".love-msg-react-btn").forEach(btn => {
      btn.onclick = async () => {
        const emoji = btn.getAttribute("data-emoji");
        await submitInteraction("love_message", c.id, emoji, null, cardEl);
      };
    });

    // Comment btn
    cardEl.querySelector(".love-msg-comment-submit").onclick = async () => {
      const commentInput = cardEl.querySelector(".love-msg-comment-input");
      const comment = commentInput.value.trim();
      if (!comment) return;
      await submitInteraction("love_message", c.id, null, comment, cardEl);
      commentInput.value = "";
    };

    loveCardsListContainer.appendChild(cardEl);
  });
}

function changeSlideshowImage() {
  const gallery = projectData.gallery || [];
  if (gallery.length === 0) return;
  
  slideImg.style.opacity = 0;
  setTimeout(() => {
    const item = gallery[currentSlideIndex];
    slideImg.src = item.image_url;
    slideCaption.innerText = item.caption || `Memory #${currentSlideIndex + 1}`;
    slideImg.style.opacity = 1;
    
    // Update dots indicator
    const dots = galleryDots.querySelectorAll("button");
    dots.forEach((dot, idx) => {
      dot.className = `w-2 h-2 rounded-full bg-slate-300 transition cursor-pointer`;
      if (idx === currentSlideIndex) dot.className += " bg-love-500 w-4";
    });
  }, 400);
}

function resetSlideshowTimer() {
  clearInterval(slideInterval);
  const gallery = projectData.gallery || [];
  slideInterval = setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % gallery.length;
    changeSlideshowImage();
  }, 5000);
}

// Submit interaction reactions/comments to DB
async function submitInteraction(type, itemId, emoji, text, cardElement = null) {
  try {
    if (isDemoMode) {
      const allInt = JSON.parse(localStorage.getItem("mock_item_interactions") || "[]");
      allInt.push({
        id: crypto.randomUUID(),
        project_id: projectData.id,
        item_type: type,
        item_id: itemId,
        reaction: emoji,
        reply: text,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("mock_item_interactions", JSON.stringify(allInt));
    } else {
      const { error } = await supabaseClient.from("item_interactions").insert({
        project_id: projectData.id,
        item_type: type,
        item_id: itemId,
        reaction: emoji,
        reply: text
      });
      if (error) throw error;
    }

    showToast("Reaction registered! ❤️");

    // Dynamic UI feedback updates (Badge overlays)
    if (emoji) {
      if (type === "gallery_image") {
        slideReactionBadge.innerHTML = `<span class="text-love-500 animate-heartbeat">${emoji}</span> Reacted!`;
        slideReactionBadge.classList.remove("scale-0");
        setTimeout(() => slideReactionBadge.classList.add("scale-0"), 3000);
      } else if (cardElement) {
        const badge = cardElement.querySelector(".reactions-badge-tag");
        badge.innerText = `${emoji} Reacted`;
        badge.classList.remove("hidden");
      }
    }
  } catch (err) {
    showToast("Failed to react: " + err.message, "error");
  }
}

// Build Timeline milestones
function buildTimelineFeed() {
  const milestones = projectData.timeline || [];
  timelineScrollFeed.innerHTML = "";
  
  if (milestones.length === 0) {
    document.getElementById("scene-timeline").classList.add("hidden");
    return;
  }

  milestones.forEach(m => {
    const div = document.createElement("div");
    div.className = "relative space-y-2 animate-slide-up";
    div.innerHTML = `
      <div class="absolute -left-8.5 top-1.5 w-5 h-5 rounded-full bg-love-500 border-4 border-white animate-heartbeat shadow-sm"></div>
      <span class="text-xs font-bold text-love-600 bg-love-50 border border-love-200 px-3 py-1 rounded-full">${new Date(m.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      <h4 class="text-lg font-bold text-slate-800 mt-2">${m.title}</h4>
      <p class="text-xs text-slate-500 font-semibold leading-relaxed max-w-lg">${m.description || ''}</p>
    `;
    timelineScrollFeed.appendChild(div);
  });
}

// Build Future dreams goals
function buildDreamsFeed() {
  const dreams = projectData.dreams || [];
  dreamsGridFeed.innerHTML = "";

  if (dreams.length === 0) {
    document.getElementById("scene-dreams").classList.add("hidden");
    return;
  }

  dreams.forEach(d => {
    const card = document.createElement("div");
    card.className = "glass-panel p-6 rounded-3xl border shadow-sm space-y-2 relative overflow-hidden transition transform hover:scale-[1.02]";
    card.innerHTML = `
      <div class="absolute top-0 left-0 w-2 h-full bg-love-500"></div>
      <h4 class="text-base font-bold text-slate-800 pl-2">${d.title}</h4>
      <p class="text-xs text-slate-500 font-semibold leading-relaxed pl-2">${d.description || ''}</p>
    `;
    dreamsGridFeed.appendChild(card);
  });
}

// Start relationship timer count
function startCountdownTimer() {
  if (!projectData.countdown_date) {
    document.getElementById("scene-countdown").classList.add("hidden");
    return;
  }
  const startDate = new Date(projectData.countdown_date).getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    timerDays.innerText = days;
    timerHours.innerText = hours;
    timerMinutes.innerText = minutes;
  }

  updateTimer();
  setInterval(updateTimer, 60000); // refresh every minute
}

// Build surprise gift boxes
function buildGiftBoxes() {
  const boxes = projectData.gifts || [];
  giftBoxesGrid.innerHTML = "";

  if (boxes.length === 0) {
    document.getElementById("scene-gifts").classList.add("hidden");
    return;
  }

  boxes.forEach((g, idx) => {
    const card = document.createElement("div");
    card.className = "glass-panel p-6 rounded-3xl border shadow-md text-center space-y-4 relative flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="w-12 h-12 bg-love-50 text-love-500 rounded-full flex items-center justify-center mx-auto mb-2 gift-box-icon animate-pulse">
          🎁
        </div>
        <h4 class="font-bold text-slate-800 text-sm">${g.title}</h4>
        <p class="text-[10px] text-slate-400">Locked box - Requires verification</p>
      </div>

      <div class="gift-unlock-wrapper space-y-3 pt-3 border-t">
        <label class="block text-[10px] font-bold text-slate-500 text-left uppercase">${g.question}</label>
        <input type="text" placeholder="Enter answer..." class="gift-ans-input w-full px-3 py-1.5 text-xs rounded-xl glass-input">
        <button class="gift-unlock-submit-btn w-full py-2 bg-love-500 hover:bg-love-600 text-white rounded-xl text-xs font-bold transition cursor-pointer">Open Gift</button>
      </div>

      <div class="gift-reward-wrapper hidden text-center space-y-2 p-3 bg-love-50 border border-love-100 rounded-2xl animate-slide-up">
        <span class="text-xl">✨🎉</span>
        <p class="text-xs font-semibold text-love-600 font-cursive text-base">${g.gift_content}</p>
      </div>
    `;

    // Unlock logic
    const input = card.querySelector(".gift-ans-input");
    const submitBtn = card.querySelector(".gift-unlock-submit-btn");
    const unlockWrapper = card.querySelector(".gift-unlock-wrapper");
    const rewardWrapper = card.querySelector(".gift-reward-wrapper");
    const icon = card.querySelector(".gift-box-icon");

    submitBtn.onclick = () => {
      const userAns = input.value.trim().toLowerCase();
      const correctAns = g.correct_answer.toLowerCase();

      if (userAns === correctAns) {
        showToast("Correct! Gift opened! 🎉");
        unlockWrapper.classList.add("hidden");
        rewardWrapper.classList.remove("hidden");
        icon.innerHTML = "🔓";
        icon.className = icon.className.replace("bg-love-50 text-love-500 animate-pulse", "bg-green-50 text-green-500");
      } else {
        // Playful replies
        const errs = [
          "That's not it 😘",
          "You can do better ❤️",
          "Think about us again 💕",
          "Ask me for a hint! 😉"
        ];
        showToast(errs[Math.floor(Math.random() * errs.length)], "error");
        input.value = "";
        input.focus();
      }
    };

    giftBoxesGrid.appendChild(card);
  });
}

// Envelope open animations
function setupEnvelopeAnimation() {
  envelopeWrapper.onclick = () => {
    envelopeFlap.style.transform = "rotateX(180deg)";
    envelopeWaxSeal.style.opacity = 0;
    
    setTimeout(() => {
      envelopeLetter.style.top = "-120px";
      envelopeLetter.style.height = "260px";
      envelopeLetter.style.zIndex = "25";
    }, 400);
  };
}

// MINI GAMES CONTROLLERS

function setupGamesTabs() {
  const tabs = [
    { btn: gameTabCatch, pane: document.getElementById("game-pane-catch") },
    { btn: gameTabQuiz, pane: document.getElementById("game-pane-quiz") },
    { btn: gameTabMatch, pane: document.getElementById("game-pane-match") }
  ];

  tabs.forEach(({ btn, pane }) => {
    btn.addEventListener("click", () => {
      // Toggle buttons
      tabs.forEach(t => t.btn.className = "flex-1 pb-2.5 text-center font-semibold text-slate-400 hover:text-love-400 cursor-pointer text-xs uppercase tracking-wider transition");
      btn.className = "flex-1 pb-2.5 text-center font-bold text-love-500 border-b-2 border-love-500 cursor-pointer text-xs uppercase tracking-wider transition";

      // Toggle panes
      tabs.forEach(t => t.pane.classList.add("hidden"));
      pane.classList.remove("hidden");

      // Stop Heart Catch loop if switching out
      if (pane.id !== "game-pane-catch") {
        catchGameRunning = false;
      }
    });
  });

  // Game start trigger
  btnStartCatch.onclick = startHeartCatchGame;
}

// GAME 1: Heart Catch Game Loop
function startHeartCatchGame() {
  catchOverlay.classList.add("hidden");
  catchGameRunning = true;
  catchScore = 0;
  catchScoreEl.innerText = "0";
  fallingHearts = [];
  
  // Set dimensions
  catchCanvas.width = catchCanvas.parentElement.clientWidth;
  catchCanvas.height = catchCanvas.parentElement.clientHeight;
  catchContext = catchCanvas.getContext("2d");
  
  basketX = catchCanvas.width / 2 - basketWidth / 2;

  // Listeners
  catchCanvas.addEventListener("mousemove", (e) => {
    const rect = catchCanvas.getBoundingClientRect();
    basketX = e.clientX - rect.left - basketWidth / 2;
  });

  catchCanvas.addEventListener("touchmove", (e) => {
    const rect = catchCanvas.getBoundingClientRect();
    basketX = e.touches[0].clientX - rect.left - basketWidth / 2;
  });

  runHeartCatchLoop();
}

function runHeartCatchLoop() {
  if (!catchGameRunning) return;

  // Clear canvas
  catchContext.clearRect(0, 0, catchCanvas.width, catchCanvas.height);

  // Spawn hearts
  if (Math.random() < 0.03) {
    fallingHearts.push({
      x: Math.random() * (catchCanvas.width - 20) + 10,
      y: -20,
      speed: Math.random() * 2 + 2,
      size: Math.random() * 12 + 10
    });
  }

  // Draw basket
  catchContext.fillStyle = "#ff0a54";
  catchContext.beginPath();
  catchContext.roundRect(basketX, catchCanvas.height - basketHeight - 5, basketWidth, basketHeight, 6);
  catchContext.fill();

  // Draw hearts
  fallingHearts.forEach((h, idx) => {
    h.y += h.speed;

    catchContext.fillStyle = "#ffccd5";
    catchContext.font = `${h.size}px Arial`;
    catchContext.fillText("❤️", h.x, h.y);

    // Collision detection
    if (h.y >= catchCanvas.height - basketHeight - 15 && h.x + 10 >= basketX && h.x - 10 <= basketX + basketWidth) {
      fallingHearts.splice(idx, 1);
      catchScore++;
      catchScoreEl.innerText = catchScore;

      if (catchScore >= 15) {
        catchGameRunning = false;
        catchHighScoreMsg.classList.remove("hidden");
        showToast("Reward Unlocked! High Score Achieved! 💖");
      }
    }

    // Out of bounds
    if (h.y > catchCanvas.height) {
      fallingHearts.splice(idx, 1);
    }
  });

  requestAnimationFrame(runHeartCatchLoop);
}

// GAME 2: Love Quiz
function buildQuizGame() {
  const quiz = projectData.quiz || [];
  quizCurrIdx.innerText = "1";
  quizTotalCnt.innerText = quiz.length;
  quizScoreEl.innerText = "0";
  quizIndex = 0;
  quizScore = 0;

  if (quiz.length === 0) {
    quizQuestionBox.innerHTML = `<p class="text-xs text-slate-400 italic text-center">No quiz questions available.</p>`;
    return;
  }
  loadQuizQuestion();
}

function loadQuizQuestion() {
  const quiz = projectData.quiz || [];
  const q = quiz[quizIndex];
  
  quizCurrIdx.innerText = quizIndex + 1;

  // Shuffle options
  const opts = [...q.options];
  const correctOptionValue = opts[0]; // original Option A
  
  // Scramble indices
  const scrambled = opts.sort(() => Math.random() - 0.5);

  quizQuestionBox.innerHTML = `
    <p class="font-serif font-black text-slate-800 text-base mb-4 text-center">${q.question}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="quiz-options-wrapper">
      ${scrambled.map(opt => `<button class="quiz-opt-btn px-4 py-3 bg-white/70 hover:bg-love-50 border border-slate-200 text-slate-700 hover:text-love-500 hover:border-love-200 rounded-xl text-xs font-bold transition transform active:scale-95 cursor-pointer" data-val="${opt}">${opt}</button>`).join("")}
    </div>
  `;

  // Option click
  quizQuestionBox.querySelectorAll(".quiz-opt-btn").forEach(btn => {
    btn.onclick = () => {
      const selected = btn.getAttribute("data-val");
      
      if (selected === correctOptionValue) {
        showToast("Correct Answer! ❤️");
        quizScore++;
        quizScoreEl.innerText = quizScore;
        btn.className = btn.className.replace("border-slate-200", "bg-green-50 border-green-500 text-green-600");
      } else {
        showToast("Oops, wrong answer 😘", "error");
        btn.className = btn.className.replace("border-slate-200", "bg-red-50 border-red-500 text-red-600");
      }

      // Lock buttons
      quizQuestionBox.querySelectorAll(".quiz-opt-btn").forEach(b => b.disabled = true);

      // Next question delay
      setTimeout(() => {
        const quiz = projectData.quiz || [];
        if (quizIndex < quiz.length - 1) {
          quizIndex++;
          loadQuizQuestion();
        } else {
          quizQuestionBox.innerHTML = `
            <div class="text-center py-6 space-y-2">
              <span class="text-4xl">🎉🏆</span>
              <h4 class="font-bold text-slate-800 text-sm">Quiz Completed!</h4>
              <p class="text-xs text-slate-500">Your final score: ${quizScore} out of ${quiz.length}</p>
            </div>
          `;
        }
      }, 1500);
    };
  });
}

// GAME 3: Memory Match Card Grid
function buildMemoryMatchGame() {
  const cardsIcons = ["❤️", "💖", "🎁", "✨", "🔑", "🌹"];
  // Duplicate for matching pairs
  let deck = [...cardsIcons, ...cardsIcons];
  deck = deck.sort(() => Math.random() - 0.5);

  memoryCardsGrid.innerHTML = "";
  selectedCards = [];
  memoryMatches = 0;
  memoryMatchWinMsg.classList.add("hidden");

  deck.forEach((icon, idx) => {
    const card = document.createElement("button");
    card.className = "w-full aspect-square bg-slate-800 hover:bg-slate-700 rounded-xl text-transparent font-bold text-xl flex items-center justify-center border shadow-sm transition transform active:scale-95 cursor-pointer memory-card-tile";
    card.setAttribute("data-icon", icon);
    card.setAttribute("data-id", idx);
    card.innerText = "?";

    card.onclick = () => {
      // Avoid clicking open cards
      if (card.classList.contains("matched") || selectedCards.some(c => c.id === idx) || selectedCards.length >= 2) return;

      // Flip card
      card.innerText = icon;
      card.className = card.className.replace("bg-slate-800 text-transparent", "bg-love-50 text-love-500 border-love-200");
      selectedCards.push({ id: idx, icon: icon, el: card });

      if (selectedCards.length === 2) {
        checkMemoryMatch();
      }
    };

    memoryCardsGrid.appendChild(card);
  });
}

function checkMemoryMatch() {
  const [c1, c2] = selectedCards;

  if (c1.icon === c2.icon) {
    // Match
    c1.el.classList.add("matched");
    c2.el.classList.add("matched");
    
    // Success effects
    c1.el.className = c1.el.className.replace("text-love-500 border-love-200", "bg-green-50 text-green-500 border-green-500");
    c2.el.className = c2.el.className.replace("text-love-500 border-love-200", "bg-green-50 text-green-500 border-green-500");

    selectedCards = [];
    memoryMatches++;

    if (memoryMatches === 6) {
      memoryMatchWinMsg.classList.remove("hidden");
      showToast("Perfect Match! You matched all pairs! 💕");
    }
  } else {
    // Mismatch reset
    setTimeout(() => {
      c1.el.innerText = "?";
      c1.el.className = c1.el.className.replace("bg-love-50 text-love-500 border-love-200", "bg-slate-800 text-transparent");
      c2.el.innerText = "?";
      c2.el.className = c2.el.className.replace("bg-love-50 text-love-500 border-love-200", "bg-slate-800 text-transparent");
      selectedCards = [];
    }, 1000);
  }
}

// Fireworks canvas implementation
function startFireworks() {
  const canvas = document.getElementById("fireworks-canvas");
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  let particles = [];

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.dx = (Math.random() - 0.5) * 8;
      this.dy = (Math.random() - 0.5) * 8;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.015;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.x += this.dx;
      this.y += this.dy;
      this.dy += 0.05; // gravity
      this.alpha -= this.decay;
    }
  }

  function spawnExplosion() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height / 2);
    const colors = ["#ff0a54", "#ff477e", "#ff85a1", "#ffd700", "#ff70a6"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 30; i++) {
      particles.push(new FireworkParticle(x, y, color));
    }
  }

  function loop() {
    if (document.hidden) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (Math.random() < 0.04) {
      spawnExplosion();
    }

    particles.forEach((p, idx) => {
      p.update();
      p.draw();
      if (p.alpha <= 0) {
        particles.splice(idx, 1);
      }
    });

    requestAnimationFrame(loop);
  }

  loop();
  
  // Handle resize
  window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
}

// Letter Feedback write back
btnFeedbackSubmit.onclick = async () => {
  const msg = feedbackInput.value.trim();
  if (!msg) {
    showToast("Please write a sweet letter message first.", "error");
    return;
  }

  btnFeedbackSubmit.disabled = true;
  btnFeedbackSubmit.innerText = "Sending letter...";

  try {
    if (isDemoMode) {
      const allFeedback = JSON.parse(localStorage.getItem("mock_partner_feedback") || "[]");
      allFeedback.push({
        id: crypto.randomUUID(),
        project_id: projectData.id,
        message: msg,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("mock_partner_feedback", JSON.stringify(allFeedback));
    } else {
      const { error } = await supabaseClient.from("partner_feedback").insert({
        project_id: projectData.id,
        message: msg
      });
      if (error) throw error;
    }

    showToast("Letter submitted to dashboard directory! ❤️");
    feedbackInput.value = "";
    btnFeedbackSubmit.innerText = "Letter Sent! ❤️";
    btnFeedbackSubmit.className = btnFeedbackSubmit.className.replace("from-love-500 to-love-600", "from-green-500 to-green-600");
  } catch (err) {
    showToast("Failed to submit feedback: " + err.message, "error");
    btnFeedbackSubmit.disabled = false;
    btnFeedbackSubmit.innerText = "Send Letter";
  }
};
