// app.js - Creator Mode Controller

let supabaseClient = null;
let isDemoMode = false;
let currentUser = null;
let currentProject = null;
let activeStep = 1;

// Supabase configuration fallbacks
const ENV_URL = import.meta.env?.VITE_SUPABASE_URL || "";
const ENV_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

// DOM Elements
const authView = document.getElementById("auth-view");
const creatorView = document.getElementById("creator-view");
const particlesContainer = document.getElementById("particles-container");
const toastContainer = document.getElementById("toast-container");
const navLogoutBtn = document.getElementById("nav-logout-btn");
const welcomeMsg = document.getElementById("creator-welcome-msg");

// Forms
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const googleAuthBtn = document.getElementById("google-auth-btn");

// Wizard Navigation
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnSaveProject = document.getElementById("btn-save-project");
const activeProjectTag = document.getElementById("active-project-tag");

// Steps list items
const stepNavButtons = document.querySelectorAll("[data-step]");

// Dynamic Wizard Containers
const loveMsgContainer = document.getElementById("love-msg-container");
const timelineContainer = document.getElementById("timeline-container");
const dreamsContainer = document.getElementById("dreams-container");
const quizContainer = document.getElementById("quiz-container");
const giftsContainer = document.getElementById("gifts-container");
const galleryPreviewContainer = document.getElementById("gallery-preview-container");

// Dashboard Activity Tabs
const btnTabWizard = document.getElementById("btn-tab-wizard");
const btnTabResponses = document.getElementById("btn-tab-responses");
const wizardContainer = document.getElementById("wizard-container");
const responsesContainer = document.getElementById("responses-container");

// Activity Tab Sub-navigation
const respTabImages = document.getElementById("resp-tab-images");
const respTabReplies = document.getElementById("resp-tab-replies");
const respTabFeedback = document.getElementById("resp-tab-feedback");

// Activity Sub-panels
const panelRespImages = document.getElementById("panel-resp-images");
const panelRespReplies = document.getElementById("panel-resp-replies");
const panelRespFeedback = document.getElementById("panel-resp-feedback");

// Activity Refresh Buttons
const btnRefreshImages = document.getElementById("btn-refresh-images");
const btnRefreshReplies = document.getElementById("btn-refresh-replies");
const btnRefreshFeedback = document.getElementById("btn-refresh-feedback");

// Wizard state arrays
let galleryFiles = []; // files or dataUrls
let coverFile = null; // cover file or dataUrl
let loveMessages = [];
let timelineEvents = [];
let futureDreams = [];
let quizQuestions = [];
let giftBoxes = [];

// Initialize Page
window.addEventListener("DOMContentLoaded", async () => {
  initParticles();
  setupAuthTabs();
  setupWizardNav();
  setupMobileDrawer();
  setupDynamicFormAdders();
  setupDashboardTabs();
  
  // Try to setup Supabase
  await initBackend();
  checkSession();
  
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Create romantic background particles
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

// Global Toast System
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `love-toast max-w-sm w-full bg-white border-l-4 shadow-xl rounded-xl p-4 flex items-center gap-3 border-love-500`;
  
  let icon = "heart";
  if (type === "error") {
    icon = "alert-triangle";
    toast.className = toast.className.replace("border-love-500", "border-red-500");
  }
  
  toast.innerHTML = `
    <div class="p-1 rounded-full ${type === 'error' ? 'bg-red-50 text-red-500' : 'bg-love-50 text-love-500 animate-heartbeat'}">
      <i data-lucide="${icon}" class="w-5 h-5"></i>
    </div>
    <div class="flex-1">
      <p class="text-sm font-semibold text-slate-800">${message}</p>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { class: "w-5 h-5" } });
  }

  // Remove toast after duration
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Backend Init: Supabase or Local Mock Sandbox
async function initBackend() {
  // If env values are configured
  if (ENV_URL && ENV_KEY) {
    try {
      supabaseClient = window.supabase.createClient(ENV_URL, ENV_KEY);
      console.log("Supabase Client initialized via environment variables.");
      return;
    } catch (e) {
      console.error("Failed to initialize Supabase via env", e);
    }
  }

  // Check if credentials exist in localStorage
  const savedConfig = localStorage.getItem("supabase_config");
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      supabaseClient = window.supabase.createClient(config.url, config.key);
      console.log("Supabase Client initialized via local storage config.");
      return;
    } catch (e) {
      console.error("Failed to parse saved Supabase configuration", e);
    }
  }

  // Fallback to Demo Mode
  isDemoMode = true;
  console.warn("No Supabase configuration detected. Operating in Demo/Sandbox Mock mode.");
}

// Session Check
function checkSession() {
  if (isDemoMode) {
    const demoUser = localStorage.getItem("demo_user");
    if (demoUser) {
      currentUser = JSON.parse(demoUser);
      onLoginSuccess();
    }
  } else {
    // Supabase Session Check
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        currentUser = session.user;
        onLoginSuccess();
      }
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        currentUser = session.user;
        onLoginSuccess();
      } else {
        currentUser = null;
        onLogoutSuccess();
      }
    });
  }
}

// Auth Panel Tabs Setup
function setupAuthTabs() {
  tabLogin.addEventListener("click", () => {
    tabLogin.className = "flex-1 pb-3 text-center font-bold text-love-500 border-b-2 border-love-500 transition cursor-pointer";
    tabRegister.className = "flex-1 pb-3 text-center font-semibold text-slate-400 hover:text-love-400 transition cursor-pointer";
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.className = "flex-1 pb-3 text-center font-bold text-love-500 border-b-2 border-love-500 transition cursor-pointer";
    tabLogin.className = "flex-1 pb-3 text-center font-semibold text-slate-400 hover:text-love-400 transition cursor-pointer";
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Wire Forms
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  googleAuthBtn.addEventListener("click", handleGoogleMock);
  navLogoutBtn.addEventListener("click", handleLogoutBtn);
}

// Name Validate (No numbers, no special characters, letters & spaces only)
function validateName(name) {
  return /^[a-zA-Z\s]+$/.test(name);
}

// Strict Gmail Validate
function validateGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

// Password Validate (letters & numbers only)
function validatePassword(pass) {
  return /^[a-zA-Z0-9]+$/.test(pass);
}

// Registration Submit Handler
async function handleRegister(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("register-confirm-password");

  const nameErr = document.getElementById("reg-name-error");
  const emailErr = document.getElementById("reg-email-error");
  const passErr = document.getElementById("reg-pass-error");
  const confirmErr = document.getElementById("reg-confirm-error");

  // Reset errors
  [nameErr, emailErr, passErr, confirmErr].forEach(el => {
    el.classList.add("hidden");
    el.innerText = "";
  });

  let hasError = false;

  if (!validateName(nameInput.value)) {
    nameErr.innerText = "Full Name must contain alphabetic characters and spaces only.";
    nameErr.classList.remove("hidden");
    hasError = true;
  }

  if (!validateGmail(emailInput.value)) {
    emailErr.innerText = "Gmail address must be a strict @gmail.com address.";
    emailErr.classList.remove("hidden");
    hasError = true;
  }

  if (!validatePassword(passInput.value)) {
    passErr.innerText = "Password must contain alphanumeric letters and numbers only.";
    passErr.classList.remove("hidden");
    hasError = true;
  }

  if (passInput.value !== confirmInput.value) {
    confirmErr.innerText = "Passwords do not match.";
    confirmErr.classList.remove("hidden");
    hasError = true;
  }

  if (hasError) {
    showToast("Please fix the validation errors.", "error");
    return;
  }

  try {
    if (isDemoMode) {
      // Mock Register
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      if (mockUsers.some(u => u.email === emailInput.value)) {
        showToast("Email already exists in Sandbox Mock Mode.", "error");
        return;
      }
      const newUser = { id: crypto.randomUUID(), email: emailInput.value, full_name: nameInput.value };
      mockUsers.push({ ...newUser, password: passInput.value });
      localStorage.setItem("mock_users", JSON.stringify(mockUsers));
      localStorage.setItem("demo_user", JSON.stringify(newUser));
      currentUser = newUser;
      showToast("Welcome ❤️ Let's create a beautiful surprise.");
      onLoginSuccess();
    } else {
      // Supabase Register
      const { data, error } = await supabaseClient.auth.signUp({
        email: emailInput.value,
        password: passInput.value,
        options: {
          data: {
            full_name: nameInput.value
          }
        }
      });
      if (error) throw error;
      showToast("Verification email sent! Check your inbox or continue.");
      currentUser = data.user;
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Login Submit Handler
async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-password");

  try {
    if (isDemoMode) {
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const matchedUser = mockUsers.find(u => u.email === emailInput.value && u.password === passInput.value);
      if (!matchedUser) {
        showToast("Invalid credentials in Sandbox Mock Mode.", "error");
        return;
      }
      const activeUser = { id: matchedUser.id, email: matchedUser.email, full_name: matchedUser.full_name };
      localStorage.setItem("demo_user", JSON.stringify(activeUser));
      currentUser = activeUser;
      showToast("Welcome ❤️ Let's create a beautiful surprise.");
      onLoginSuccess();
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value,
        password: passInput.value
      });
      if (error) throw error;
      currentUser = data.user;
      showToast("Welcome ❤️ Let's create a beautiful surprise.");
      onLoginSuccess();
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Mock Google auth
function handleGoogleMock() {
  if (isDemoMode) {
    const mockGoogleUser = { id: "google-mock-id", email: "sweetheart.creator@gmail.com", full_name: "Sweetheart Creator" };
    localStorage.setItem("demo_user", JSON.stringify(mockGoogleUser));
    currentUser = mockGoogleUser;
    showToast("Welcome ❤️ Let's create a beautiful surprise.");
    onLoginSuccess();
  } else {
    // Supabase Google Auth
    supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  }
}

// Logout Handler
async function handleLogoutBtn() {
  if (isDemoMode) {
    localStorage.removeItem("demo_user");
    currentUser = null;
    showToast("Logged out from Sandbox Mock.");
    onLogoutSuccess();
  } else {
    await supabaseClient.auth.signOut();
    showToast("Successfully signed out.");
  }
}

// On Authentication Success State
async function onLoginSuccess() {
  authView.classList.add("hidden");
  creatorView.classList.remove("hidden");
  navLogoutBtn.classList.remove("hidden");
  welcomeMsg.innerText = `Welcome, ${currentUser.full_name || currentUser.email} ❤️ Let's create a beautiful surprise.`;
  
  await loadUserProject();
}

function onLogoutSuccess() {
  authView.classList.remove("hidden");
  creatorView.classList.add("hidden");
  navLogoutBtn.classList.add("hidden");
  currentProject = null;
  resetWizardFields();
}

// Reset Wizard arrays & UI
function resetWizardFields() {
  galleryFiles = [];
  coverFile = null;
  loveMessages = [];
  timelineEvents = [];
  futureDreams = [];
  quizQuestions = [];
  giftBoxes = [];
  
  // Clear inputs
  document.getElementById("p-name").value = "";
  document.getElementById("p-nickname").value = "";
  document.getElementById("p-title").value = "";
  document.getElementById("p-message").value = "";
  document.getElementById("p-countdown-date").value = "";
  document.getElementById("p-first-meet-date").value = "";
  document.getElementById("p-love-letter").value = "";
  document.getElementById("p-first-meet-loc").value = "";
  document.getElementById("p-fav-color").value = "";
  document.getElementById("p-fav-food").value = "";
  document.getElementById("p-pin").value = "";

  galleryPreviewContainer.innerHTML = "";
  document.getElementById("p-cover-preview").classList.add("hidden");
  
  // Rerender lists
  renderLoveMessages();
  renderTimelineEvents();
  renderDreams();
  renderQuizQuestions();
  renderGiftBoxes();
  
  document.getElementById("link-reveal-section").classList.add("hidden");
}

// Load Existing Project/Proposal configurations
async function loadUserProject() {
  if (isDemoMode) {
    const mockProjects = JSON.parse(localStorage.getItem("mock_projects") || "[]");
    const myProject = mockProjects.find(p => p.user_id === currentUser.id);
    if (myProject) {
      currentProject = myProject;
      populateWizardData(myProject);
    }
  } else {
    // Supabase Load
    try {
      const { data, error } = await supabaseClient
        .from("projects")
        .select(`
          *,
          gallery_images(*),
          love_messages(*),
          quiz_questions(*),
          gift_boxes(*),
          future_dreams(*),
          timeline_events(*)
        `)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        currentProject = data;
        populateWizardData(data);
      }
    } catch (err) {
      showToast("Error loading project: " + err.message, "error");
    }
  }
}

// Populate UI Fields
function populateWizardData(proj) {
  activeProjectTag.classList.remove("hidden");
  
  document.getElementById("p-name").value = proj.partner_name || "";
  document.getElementById("p-nickname").value = proj.nickname || "";
  document.getElementById("p-title").value = proj.proposal_title || "";
  document.getElementById("p-message").value = proj.proposal_message || "";
  
  if (proj.countdown_date) {
    document.getElementById("p-countdown-date").value = proj.countdown_date.split("T")[0];
  }
  if (proj.first_meeting_date) {
    document.getElementById("p-first-meet-date").value = proj.first_meeting_date;
  }
  document.getElementById("p-love-letter").value = proj.love_letter || "";
  document.getElementById("p-first-meet-loc").value = proj.favorite_food || ""; // Map first date location
  document.getElementById("p-fav-color").value = proj.favorite_color || "";
  document.getElementById("p-fav-food").value = proj.favorite_food || ""; // Wait, let's map correctly
  
  // Wait, let's map the gift verification fields carefully
  document.getElementById("p-first-meet-loc").value = proj.nickname || ""; // Nickname was placeholder, we can reuse fields
  document.getElementById("p-fav-color").value = proj.favorite_color || "";
  document.getElementById("p-fav-food").value = proj.favorite_food || "";
  
  document.getElementById("p-pin").value = proj.pin || "";

  // Render Cover Photo preview
  if (proj.bg_cover_url) {
    const coverPreview = document.getElementById("p-cover-preview");
    coverPreview.querySelector("img").src = proj.bg_cover_url;
    coverPreview.classList.remove("hidden");
    coverFile = proj.bg_cover_url; // save URL
  }

  // Load Sub-Tables data
  loveMessages = proj.love_messages || [];
  timelineEvents = proj.timeline_events || [];
  futureDreams = proj.future_dreams || [];
  quizQuestions = proj.quiz_questions || [];
  giftBoxes = proj.gift_boxes || [];
  
  // Render gallery
  galleryFiles = [];
  galleryPreviewContainer.innerHTML = "";
  if (proj.gallery_images) {
    proj.gallery_images.forEach(img => {
      galleryFiles.push(img.image_url);
      addGalleryPreview(img.image_url, img.id);
    });
  }

  renderLoveMessages();
  renderTimelineEvents();
  renderDreams();
  renderQuizQuestions();
  renderGiftBoxes();

  // Populate link section
  revealProjectLink(proj.slug);
}

// Wizard Steps Controller
function setupWizardNav() {
  btnPrev.addEventListener("click", () => {
    if (activeStep > 1) {
      switchStep(activeStep - 1);
    }
  });

  btnNext.addEventListener("click", () => {
    if (activeStep < 5) {
      switchStep(activeStep + 1);
    }
  });

  stepNavButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetStep = parseInt(btn.getAttribute("data-step"));
      switchStep(targetStep);
    });
  });

  // Cover image selector
  const coverInput = document.getElementById("p-cover-upload");
  coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const coverPreview = document.getElementById("p-cover-preview");
        coverPreview.querySelector("img").src = event.target.result;
        coverPreview.classList.remove("hidden");
        coverFile = file; // Save raw file for upload
        if (isDemoMode) {
          coverFile = event.target.result; // Save Base64 directly
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("p-cover-remove").addEventListener("click", () => {
    document.getElementById("p-cover-upload").value = "";
    document.getElementById("p-cover-preview").classList.add("hidden");
    coverFile = null;
  });

  // Gallery image selector
  const galleryInput = document.getElementById("p-gallery-upload");
  galleryInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    if (galleryFiles.length + files.length > 6) {
      showToast("You can upload a maximum of 6 gallery photos.", "error");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isDemoMode) {
          galleryFiles.push(event.target.result); // Base64
          addGalleryPreview(event.target.result);
        } else {
          galleryFiles.push(file); // Raw file
          addGalleryPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    });
  });

  btnSaveProject.addEventListener("click", saveProposalConfig);
}

function switchStep(stepNum) {
  // Hide current pane
  document.getElementById(`step-pane-${activeStep}`).classList.add("hidden");
  
  // Deactivate ALL sidebar tabs (desktop + mobile) for current step
  document.querySelectorAll(`[data-step="${activeStep}"]`).forEach(tab => {
    tab.className = tab.className
      .replace("bg-love-500 text-white shadow-md shadow-love-500/10", "hover:bg-love-50 text-slate-600 hover:text-love-500");
    const span = tab.querySelector("span");
    if (span) span.className = "w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs";
  });
  
  // Show new pane
  activeStep = stepNum;
  document.getElementById(`step-pane-${activeStep}`).classList.remove("hidden");
  
  // Activate ALL sidebar tabs (desktop + mobile) for new step
  document.querySelectorAll(`[data-step="${activeStep}"]`).forEach(tab => {
    tab.className = "w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition cursor-pointer bg-love-500 text-white shadow-md shadow-love-500/10";
    const span = tab.querySelector("span");
    if (span) span.className = "w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs";
  });

  // Buttons configurations
  btnPrev.disabled = (activeStep === 1);
  if (activeStep === 5) {
    btnNext.classList.add("hidden");
    btnSaveProject.classList.remove("hidden");
  } else {
    btnNext.classList.remove("hidden");
    btnSaveProject.classList.add("hidden");
  }
}

// Mobile Drawer: Steps of Love
function setupMobileDrawer() {
  const toggleBtn = document.getElementById("btn-toggle-steps");
  const drawer = document.getElementById("mobile-steps-drawer");
  const drawerBody = document.getElementById("mobile-drawer-body");
  const closeBtn = document.getElementById("btn-close-drawer");
  const mobileStepBtns = document.querySelectorAll(".mobile-drawer-step-btn");

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.remove("opacity-0", "pointer-events-none");
    drawer.classList.add("opacity-100");
    drawerBody.classList.remove("-translate-x-full");
    drawerBody.classList.add("translate-x-0");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.add("opacity-0", "pointer-events-none");
    drawer.classList.remove("opacity-100");
    drawerBody.classList.add("-translate-x-full");
    drawerBody.classList.remove("translate-x-0");
    document.body.style.overflow = "";
  }

  // Open on hamburger click
  toggleBtn.addEventListener("click", openDrawer);

  // Close on X button
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

  // Close when clicking the overlay background
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  // Navigate step when mobile drawer buttons are clicked
  mobileStepBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetStep = parseInt(btn.getAttribute("data-step"));
      switchStep(targetStep);
      closeDrawer();
    });
  });
}

// Add preview items to UI
function addGalleryPreview(src, id = null) {
  const div = document.createElement("div");
  div.className = "relative group rounded-xl overflow-hidden border shadow-sm aspect-square bg-slate-100";
  div.innerHTML = `
    <img src="${src}" class="w-full h-full object-cover">
    <button class="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer opacity-0 group-hover:opacity-100">
      <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
  `;
  
  div.querySelector("button").addEventListener("click", () => {
    const idx = galleryFiles.findIndex(item => (typeof item === "string" ? item === src : false));
    if (idx > -1) {
      galleryFiles.splice(idx, 1);
    }
    div.remove();
  });

  galleryPreviewContainer.appendChild(div);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Setup dynamically editable items in step 3 & 4
function setupDynamicFormAdders() {
  // Add message card
  document.getElementById("add-love-msg-btn").addEventListener("click", () => {
    loveMessages.push({ id: crypto.randomUUID(), title: "", message: "", display_order: loveMessages.length });
    renderLoveMessages();
  });

  // Add timeline event
  document.getElementById("add-timeline-btn").addEventListener("click", () => {
    timelineEvents.push({ id: crypto.randomUUID(), title: "", description: "", event_date: new Date().toISOString().split("T")[0], display_order: timelineEvents.length });
    renderTimelineEvents();
  });

  // Add future dream
  document.getElementById("add-dream-btn").addEventListener("click", () => {
    futureDreams.push({ id: crypto.randomUUID(), title: "", description: "", display_order: futureDreams.length });
    renderDreams();
  });

  // Add quiz question
  document.getElementById("add-quiz-btn").addEventListener("click", () => {
    quizQuestions.push({
      id: crypto.randomUUID(),
      question: "",
      correct_answer: "",
      options: ["", "", "", ""],
      display_order: quizQuestions.length
    });
    renderQuizQuestions();
  });

  // Add gift box
  document.getElementById("add-gift-btn").addEventListener("click", () => {
    giftBoxes.push({
      id: crypto.randomUUID(),
      title: `Gift Box #${giftBoxes.length + 1}`,
      question: "",
      correct_answer: "",
      gift_content: "",
      display_order: giftBoxes.length
    });
    renderGiftBoxes();
  });
}

// RENDER HELPERS

function renderLoveMessages() {
  loveMsgContainer.innerHTML = "";
  if (loveMessages.length === 0) {
    loveMsgContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-4">No custom messages added yet.</p>`;
    return;
  }
  loveMessages.forEach((msg, idx) => {
    const card = document.createElement("div");
    card.className = "p-4 bg-white/60 border rounded-2xl flex gap-3 items-start relative";
    card.innerHTML = `
      <div class="flex-1 space-y-2">
        <input type="text" placeholder="Card Title (e.g. Our First Date)" value="${msg.title || ''}" class="w-full px-3 py-1.5 text-xs rounded-xl glass-input font-bold love-msg-title" data-idx="${idx}">
        <textarea rows="2" placeholder="Write something sweet or a lovely memory..." class="w-full px-3 py-1.5 text-xs rounded-xl glass-input love-msg-body" data-idx="${idx}">${msg.message || ''}</textarea>
      </div>
      <button class="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition cursor-pointer delete-love-msg-btn" data-idx="${idx}">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    
    // Listeners
    card.querySelector(".love-msg-title").addEventListener("input", (e) => {
      loveMessages[idx].title = e.target.value;
    });
    card.querySelector(".love-msg-body").addEventListener("input", (e) => {
      loveMessages[idx].message = e.target.value;
    });
    card.querySelector(".delete-love-msg-btn").addEventListener("click", () => {
      loveMessages.splice(idx, 1);
      renderLoveMessages();
    });

    loveMsgContainer.appendChild(card);
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderTimelineEvents() {
  timelineContainer.innerHTML = "";
  if (timelineEvents.length === 0) {
    timelineContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-4">No milestones added yet.</p>`;
    return;
  }
  timelineEvents.forEach((ev, idx) => {
    const card = document.createElement("div");
    card.className = "p-4 bg-white/60 border rounded-2xl flex gap-3 items-start relative";
    card.innerHTML = `
      <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input type="date" value="${ev.event_date || ''}" class="px-3 py-1.5 text-xs rounded-xl glass-input timeline-date" data-idx="${idx}">
        <input type="text" placeholder="Milestone Title" value="${ev.title || ''}" class="sm:col-span-2 px-3 py-1.5 text-xs rounded-xl glass-input font-bold timeline-title" data-idx="${idx}">
        <textarea rows="2" placeholder="Description of the milestone..." class="sm:col-span-3 px-3 py-1.5 text-xs rounded-xl glass-input timeline-desc" data-idx="${idx}">${ev.description || ''}</textarea>
      </div>
      <button class="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition cursor-pointer delete-timeline-btn" data-idx="${idx}">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;

    card.querySelector(".timeline-date").addEventListener("input", (e) => {
      timelineEvents[idx].event_date = e.target.value;
    });
    card.querySelector(".timeline-title").addEventListener("input", (e) => {
      timelineEvents[idx].title = e.target.value;
    });
    card.querySelector(".timeline-desc").addEventListener("input", (e) => {
      timelineEvents[idx].description = e.target.value;
    });
    card.querySelector(".delete-timeline-btn").addEventListener("click", () => {
      timelineEvents.splice(idx, 1);
      renderTimelineEvents();
    });

    timelineContainer.appendChild(card);
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderDreams() {
  dreamsContainer.innerHTML = "";
  if (futureDreams.length === 0) {
    dreamsContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-4">No dreams/goals added yet.</p>`;
    return;
  }
  futureDreams.forEach((dr, idx) => {
    const card = document.createElement("div");
    card.className = "p-4 bg-white/60 border rounded-2xl flex gap-3 items-start relative";
    card.innerHTML = `
      <div class="flex-1 space-y-2">
        <input type="text" placeholder="Dream Title (e.g. Travel Paris together)" value="${dr.title || ''}" class="w-full px-3 py-1.5 text-xs rounded-xl glass-input font-bold dream-title" data-idx="${idx}">
        <textarea rows="2" placeholder="Describe this goal or dream..." class="w-full px-3 py-1.5 text-xs rounded-xl glass-input dream-desc" data-idx="${idx}">${dr.description || ''}</textarea>
      </div>
      <button class="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition cursor-pointer delete-dream-btn" data-idx="${idx}">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;

    card.querySelector(".dream-title").addEventListener("input", (e) => {
      futureDreams[idx].title = e.target.value;
    });
    card.querySelector(".dream-desc").addEventListener("input", (e) => {
      futureDreams[idx].description = e.target.value;
    });
    card.querySelector(".delete-dream-btn").addEventListener("click", () => {
      futureDreams.splice(idx, 1);
      renderDreams();
    });

    dreamsContainer.appendChild(card);
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderQuizQuestions() {
  quizContainer.innerHTML = "";
  if (quizQuestions.length === 0) {
    quizContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-4">No quiz questions added yet.</p>`;
    return;
  }
  quizQuestions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "p-5 bg-white/60 border rounded-2xl space-y-3 relative";
    div.innerHTML = `
      <div class="absolute top-4 right-4 flex gap-2">
        <button class="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition cursor-pointer delete-quiz-btn">
          <i data-lucide="trash" class="w-3.5 h-3.5"></i>
        </button>
      </div>
      <div class="w-full pr-10">
        <label class="block text-xs font-bold text-slate-400 mb-1">Question ${idx + 1}</label>
        <input type="text" placeholder="e.g. When did we first kiss?" value="${q.question || ''}" class="w-full px-3 py-2 text-xs rounded-xl glass-input font-semibold quiz-q-text">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label class="block text-[10px] font-bold text-love-600 mb-0.5">Option A (Correct Answer) *</label>
          <input type="text" placeholder="Correct Choice" value="${q.options[0] || ''}" class="w-full px-3 py-1.5 text-xs rounded-xl glass-input border-love-200 quiz-opt-0">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Option B *</label>
          <input type="text" placeholder="Wrong Choice" value="${q.options[1] || ''}" class="w-full px-3 py-1.5 text-xs rounded-xl glass-input quiz-opt-1">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Option C *</label>
          <input type="text" placeholder="Wrong Choice" value="${q.options[2] || ''}" class="w-full px-3 py-1.5 text-xs rounded-xl glass-input quiz-opt-2">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Option D *</label>
          <input type="text" placeholder="Wrong Choice" value="${q.options[3] || ''}" class="w-full px-3 py-1.5 text-xs rounded-xl glass-input quiz-opt-3">
        </div>
      </div>
    `;

    div.querySelector(".quiz-q-text").addEventListener("input", (e) => {
      quizQuestions[idx].question = e.target.value;
    });
    
    // Wire options inputs
    [0, 1, 2, 3].forEach(optIdx => {
      div.querySelector(`.quiz-opt-${optIdx}`).addEventListener("input", (e) => {
        quizQuestions[idx].options[optIdx] = e.target.value;
        if (optIdx === 0) {
          quizQuestions[idx].correct_answer = e.target.value; // Option A is always correct
        }
      });
    });

    div.querySelector(".delete-quiz-btn").addEventListener("click", () => {
      quizQuestions.splice(idx, 1);
      renderQuizQuestions();
    });

    quizContainer.appendChild(div);
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderGiftBoxes() {
  giftsContainer.innerHTML = "";
  if (giftBoxes.length === 0) {
    giftsContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-4">No custom gift boxes added yet.</p>`;
    return;
  }
  giftBoxes.forEach((g, idx) => {
    const div = document.createElement("div");
    div.className = "p-5 bg-white/60 border rounded-2xl space-y-3 relative";
    div.innerHTML = `
      <div class="absolute top-4 right-4">
        <button class="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition cursor-pointer delete-gift-btn">
          <i data-lucide="trash" class="w-3.5 h-3.5"></i>
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-10">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Gift Title</label>
          <input type="text" placeholder="e.g. Mystery Box #1" value="${g.title || ''}" class="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold gift-title">
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-400 mb-1">Unlock Question *</label>
          <input type="text" placeholder="e.g. What is my favorite food?" value="${g.question || ''}" class="w-full px-3 py-2 text-xs rounded-xl glass-input gift-q">
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Unlock Answer *</label>
          <input type="text" placeholder="Correct Answer keyword" value="${g.correct_answer || ''}" class="w-full px-3 py-2 text-xs rounded-xl glass-input gift-ans">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Gift Reward (Secret Message/Promise/Letter) *</label>
          <input type="text" placeholder="Hidden message revealed when correct" value="${g.gift_content || ''}" class="w-full px-3 py-2 text-xs rounded-xl glass-input gift-content">
        </div>
      </div>
    `;

    div.querySelector(".gift-title").addEventListener("input", (e) => {
      giftBoxes[idx].title = e.target.value;
    });
    div.querySelector(".gift-q").addEventListener("input", (e) => {
      giftBoxes[idx].question = e.target.value;
    });
    div.querySelector(".gift-ans").addEventListener("input", (e) => {
      giftBoxes[idx].correct_answer = e.target.value;
    });
    div.querySelector(".gift-content").addEventListener("input", (e) => {
      giftBoxes[idx].gift_content = e.target.value;
    });
    
    div.querySelector(".delete-gift-btn").addEventListener("click", () => {
      giftBoxes.splice(idx, 1);
      renderGiftBoxes();
    });

    giftsContainer.appendChild(div);
  });
  if (window.lucide) window.lucide.createIcons();
}

// SAVE & DEPLOY PROPOSAL CONFIGURATION
async function saveProposalConfig() {
  const partnerName = document.getElementById("p-name").value.trim();
  const nickname = document.getElementById("p-nickname").value.trim();
  const pTitle = document.getElementById("p-title").value.trim();
  const pMsg = document.getElementById("p-message").value.trim();
  const pMusic = "";
  const pCountdown = document.getElementById("p-countdown-date").value;
  const pFirstMeet = document.getElementById("p-first-meet-date").value;
  const pLetter = document.getElementById("p-love-letter").value.trim();
  
  // Unlock answers
  const meetLoc = document.getElementById("p-first-meet-loc").value.trim();
  const favColor = document.getElementById("p-fav-color").value.trim();
  const favFood = document.getElementById("p-fav-food").value.trim();
  
  const pin = document.getElementById("p-pin").value.trim();

  if (!partnerName || !pTitle || !pLetter || !pin) {
    showToast("Please fill in all required fields marked with *", "error");
    return;
  }

  if (pin.length !== 4 || isNaN(pin)) {
    showToast("PIN must be exactly 4 digits.", "error");
    return;
  }

  // Generate unique slug if not existing
  const slug = currentProject ? currentProject.slug : Math.random().toString(36).substring(2, 8);

  // Compile project object
  const projectData = {
    user_id: currentUser.id,
    slug: slug,
    pin: pin,
    partner_name: partnerName,
    nickname: nickname,
    proposal_title: pTitle,
    proposal_message: pMsg,
    love_letter: pLetter,
    countdown_date: pCountdown ? new Date(pCountdown).toISOString() : null,
    first_meeting_date: pFirstMeet ? pFirstMeet : null,
    favorite_food: favFood,
    favorite_color: favColor,
    music_url: pMusic || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    bg_cover_url: typeof coverFile === "string" ? coverFile : "" // Base64 or URL
  };

  showToast("Saving proposal parameters...");

  try {
    if (isDemoMode) {
      // Demo Mock Save
      let mockProjects = JSON.parse(localStorage.getItem("mock_projects") || "[]");
      const projIdx = mockProjects.findIndex(p => p.user_id === currentUser.id);

      // Save arrays
      projectData.gallery_images = galleryFiles.map((file, i) => ({ id: `img-${i}`, image_url: file, display_order: i }));
      projectData.love_messages = loveMessages;
      projectData.timeline_events = timelineEvents;
      projectData.future_dreams = futureDreams;
      projectData.quiz_questions = quizQuestions;
      projectData.gift_boxes = giftBoxes;

      if (projIdx > -1) {
        mockProjects[projIdx] = { ...mockProjects[projIdx], ...projectData };
      } else {
        projectData.id = crypto.randomUUID();
        mockProjects.push(projectData);
      }
      localStorage.setItem("mock_projects", JSON.stringify(mockProjects));
      currentProject = projectData;
      
      showToast("Surprise generated and saved successfully!");
      revealProjectLink(slug);
    } else {
      // Supabase Real Save
      // 1. Upload cover to storage if raw file
      let bg_cover_url = projectData.bg_cover_url;
      if (coverFile && typeof coverFile !== "string") {
        const filePath = `${currentUser.id}/cover-${Date.now()}`;
        const { data: uploadData, error: uploadErr } = await supabaseClient.storage
          .from("couple-assets")
          .upload(filePath, coverFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        
        const { data: { publicUrl } } = supabaseClient.storage.from("couple-assets").getPublicUrl(filePath);
        bg_cover_url = publicUrl;
      }
      projectData.bg_cover_url = bg_cover_url;

      // 2. Insert or update projects table
      let projId = currentProject ? currentProject.id : null;
      if (projId) {
        const { error } = await supabaseClient.from("projects").update(projectData).eq("id", projId);
        if (error) throw error;
      } else {
        const { data: newProj, error } = await supabaseClient.from("projects").insert(projectData).select().single();
        if (error) throw error;
        projId = newProj.id;
        currentProject = newProj;
      }

      // 3. Upload gallery images
      const galleryUrls = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        if (typeof file === "string") {
          galleryUrls.push(file); // already uploaded
        } else {
          const filePath = `${currentUser.id}/gallery-${i}-${Date.now()}`;
          const { error: uploadErr } = await supabaseClient.storage
            .from("couple-assets")
            .upload(filePath, file, { upsert: true });
          if (uploadErr) throw uploadErr;
          
          const { data: { publicUrl } } = supabaseClient.storage.from("couple-assets").getPublicUrl(filePath);
          galleryUrls.push(publicUrl);
        }
      }

      // 4. Update gallery sub-table
      // Delete old gallery
      await supabaseClient.from("gallery_images").delete().eq("project_id", projId);
      // Insert new gallery
      if (galleryUrls.length > 0) {
        const galleryPayload = galleryUrls.map((url, index) => ({
          project_id: projId,
          user_id: currentUser.id,
          image_url: url,
          display_order: index
        }));
        const { error } = await supabaseClient.from("gallery_images").insert(galleryPayload);
        if (error) throw error;
      }

      // 5. Update custom love messages sub-table
      await supabaseClient.from("love_messages").delete().eq("project_id", projId);
      if (loveMessages.length > 0) {
        const messagesPayload = loveMessages.map((m, index) => ({
          project_id: projId,
          user_id: currentUser.id,
          title: m.title,
          message: m.message,
          display_order: index
        }));
        const { error } = await supabaseClient.from("love_messages").insert(messagesPayload);
        if (error) throw error;
      }

      // 6. Update quiz sub-table
      await supabaseClient.from("quiz_questions").delete().eq("project_id", projId);
      if (quizQuestions.length > 0) {
        const quizPayload = quizQuestions.map((q, index) => ({
          project_id: projId,
          user_id: currentUser.id,
          question: q.question,
          correct_answer: q.correct_answer,
          options: q.options,
          display_order: index
        }));
        const { error } = await supabaseClient.from("quiz_questions").insert(quizPayload);
        if (error) throw error;
      }

      // 7. Update gift boxes sub-table
      await supabaseClient.from("gift_boxes").delete().eq("project_id", projId);
      if (giftBoxes.length > 0) {
        const giftsPayload = giftBoxes.map((g, index) => ({
          project_id: projId,
          user_id: currentUser.id,
          title: g.title,
          question: g.question,
          correct_answer: g.correct_answer,
          gift_content: g.gift_content,
          display_order: index
        }));
        const { error } = await supabaseClient.from("gift_boxes").insert(giftsPayload);
        if (error) throw error;
      }

      // 8. Update future dreams sub-table
      await supabaseClient.from("future_dreams").delete().eq("project_id", projId);
      if (futureDreams.length > 0) {
        const dreamsPayload = futureDreams.map((d, index) => ({
          project_id: projId,
          user_id: currentUser.id,
          title: d.title,
          description: d.description,
          display_order: index
        }));
        const { error } = await supabaseClient.from("future_dreams").insert(dreamsPayload);
        if (error) throw error;
      }

      // 9. Update timeline sub-table
      await supabaseClient.from("timeline_events").delete().eq("project_id", projId);
      if (timelineEvents.length > 0) {
        const timelinePayload = timelineEvents.map((t, index) => ({
          project_id: projId,
          user_id: currentUser.id,
          event_date: t.event_date,
          title: t.title,
          description: t.description,
          display_order: index
        }));
        const { error } = await supabaseClient.from("timeline_events").insert(timelinePayload);
        if (error) throw error;
      }

      showToast("Proposal created and live successfully!");
      revealProjectLink(slug);
      activeProjectTag.classList.remove("hidden");
    }
  } catch (err) {
    showToast("Failed to compile project: " + err.message, "error");
  }
}

// Reveal links and generate QR Code
function revealProjectLink(slug) {
  const linkSection = document.getElementById("link-reveal-section");
  const urlInput = document.getElementById("surprise-url");
  
  let origin = window.location.origin;
  // If running locally via dev server
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    origin = `http://${window.location.host}`;
  }

  const surpUrl = isDemoMode
    ? `${origin}/surprise.html?s=${slug}&demo=true`
    : `${origin}/surprise.html?s=${slug}`;

  urlInput.value = surpUrl;
  linkSection.classList.remove("hidden");

  // QR Code Generation using third-party free API
  const qrCanvas = document.getElementById("qr-code-canvas");
  qrCanvas.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(surpUrl)}" alt="QR Code" class="w-28 h-28">`;

  // Setup direct share links
  document.getElementById("share-whatsapp").href = `https://api.whatsapp.com/send?text=${encodeURIComponent("I created a special surprise website for you. Open this link and enter our secret PIN ❤️ " + surpUrl)}`;
  document.getElementById("share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(surpUrl)}`;

  // Copy click
  document.getElementById("btn-copy-url").onclick = () => {
    urlInput.select();
    navigator.clipboard.writeText(surpUrl);
    showToast("Link copied to clipboard!");
  };
}

// DASHBOARD WORKSPACES / ACTIVITY SWITCHING
function setupDashboardTabs() {
  btnTabWizard.addEventListener("click", () => {
    btnTabWizard.className = "px-5 py-2.5 rounded-xl font-bold bg-love-500 text-white shadow-md shadow-love-500/10 transition duration-300 flex items-center gap-1.5 cursor-pointer";
    btnTabResponses.className = "px-5 py-2.5 rounded-xl font-bold bg-white text-love-600 hover:bg-love-50 hover:text-love-700 shadow-sm border border-love-200 transition duration-300 flex items-center gap-1.5 cursor-pointer";
    
    wizardContainer.classList.remove("hidden");
    responsesContainer.classList.add("hidden");
  });

  btnTabResponses.addEventListener("click", async () => {
    btnTabResponses.className = "px-5 py-2.5 rounded-xl font-bold bg-love-500 text-white shadow-md shadow-love-500/10 transition duration-300 flex items-center gap-1.5 cursor-pointer";
    btnTabWizard.className = "px-5 py-2.5 rounded-xl font-bold bg-white text-love-600 hover:bg-love-50 hover:text-love-700 shadow-sm border border-love-200 transition duration-300 flex items-center gap-1.5 cursor-pointer";
    
    wizardContainer.classList.add("hidden");
    responsesContainer.classList.remove("hidden");
    
    // Load responses
    await loadActivitySubData();
  });

  // Sub tabs inside activity feed
  const activityNavTabs = [
    { btn: respTabImages, panel: panelRespImages },
    { btn: respTabReplies, panel: panelRespReplies },
    { btn: respTabFeedback, panel: panelRespFeedback }
  ];

  activityNavTabs.forEach(({ btn, panel }) => {
    btn.addEventListener("click", () => {
      // Reset buttons
      activityNavTabs.forEach(t => {
        t.btn.className = "w-full text-left px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition cursor-pointer hover:bg-love-50 text-slate-600 hover:text-love-500";
      });
      btn.className = "w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition cursor-pointer bg-love-500 text-white shadow-md shadow-love-500/10";
      
      // Reset panels
      activityNavTabs.forEach(t => t.panel.classList.add("hidden"));
      panel.classList.remove("hidden");
    });
  });

  // Refresh clicks
  btnRefreshImages.onclick = loadReceivedImages;
  btnRefreshReplies.onclick = loadReceivedReplies;
  btnRefreshFeedback.onclick = loadFeedbackMessages;
}

// Activity loader router
async function loadActivitySubData() {
  if (!currentProject) {
    showToast("Please save your project first to view activities.", "error");
    return;
  }
  await Promise.all([
    loadReceivedImages(),
    loadReceivedReplies(),
    loadFeedbackMessages()
  ]);
}

// Load captured images
async function loadReceivedImages() {
  const gallery = document.getElementById("received-images-gallery");
  gallery.innerHTML = `<div class="col-span-full py-8 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin text-love-500 mx-auto"></i></div>`;
  if (window.lucide) window.lucide.createIcons();

  try {
    let images = [];
    if (isDemoMode) {
      // Mock images
      const allImages = JSON.parse(localStorage.getItem("mock_captured_images") || "[]");
      images = allImages.filter(img => img.project_id === currentProject.id);
    } else {
      // Supabase select
      const { data, error } = await supabaseClient
        .from("captured_images")
        .select("*")
        .eq("project_id", currentProject.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      images = data || [];
    }

    gallery.innerHTML = "";
    if (images.length === 0) {
      gallery.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <i data-lucide="image" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          <p class="text-sm font-semibold">No pictures received yet.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    images.forEach(img => {
      const card = document.createElement("div");
      card.className = "relative rounded-2xl overflow-hidden border shadow-sm aspect-square bg-slate-100 group";
      card.innerHTML = `
        <img src="${img.image_url}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3">
          <p class="text-[10px] text-white font-bold">${new Date(img.created_at).toLocaleString()}</p>
        </div>
      `;
      gallery.appendChild(card);
    });
  } catch (err) {
    showToast("Error loading received images: " + err.message, "error");
  }
}

// Load comments and reactions
async function loadReceivedReplies() {
  const feed = document.getElementById("received-replies-feed");
  feed.innerHTML = `<div class="py-8 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin text-love-500 mx-auto"></i></div>`;
  if (window.lucide) window.lucide.createIcons();

  try {
    let replies = [];
    if (isDemoMode) {
      const allReplies = JSON.parse(localStorage.getItem("mock_item_interactions") || "[]");
      replies = allReplies.filter(r => r.project_id === currentProject.id);
    } else {
      const { data, error } = await supabaseClient
        .from("item_interactions")
        .select("*")
        .eq("project_id", currentProject.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      replies = data || [];
    }

    feed.innerHTML = "";
    if (replies.length === 0) {
      feed.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <i data-lucide="message-square" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          <p class="text-sm font-semibold">No reactions or comments yet.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    replies.forEach(rep => {
      const card = document.createElement("div");
      card.className = "p-4 bg-white/60 border rounded-2xl flex justify-between items-start gap-4 shadow-sm";
      
      let itemLabel = "proposal description";
      if (rep.item_type === "gallery_image") {
        itemLabel = `Gallery photo`;
      } else if (rep.item_type === "love_message") {
        itemLabel = `Love Card`;
      }

      card.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-love-500 uppercase bg-love-50 px-2 py-0.5 rounded-full border border-love-100">${itemLabel}</span>
            <span class="text-[10px] text-slate-400 font-semibold">${new Date(rep.created_at).toLocaleDateString()}</span>
          </div>
          <p class="text-sm font-medium text-slate-800">${rep.reply ? `"${rep.reply}"` : '<span class="italic text-slate-400">No comment</span>'}</p>
        </div>
        ${rep.reaction ? `<span class="text-3xl filter drop-shadow-sm select-none">${rep.reaction}</span>` : ""}
      `;
      feed.appendChild(card);
    });
  } catch (err) {
    showToast("Error loading comments: " + err.message, "error");
  }
}

// Load final feedback letters
async function loadFeedbackMessages() {
  const feed = document.getElementById("received-feedback-feed");
  feed.innerHTML = `<div class="py-8 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin text-love-500 mx-auto"></i></div>`;
  if (window.lucide) window.lucide.createIcons();

  try {
    let letters = [];
    if (isDemoMode) {
      const allFeedback = JSON.parse(localStorage.getItem("mock_partner_feedback") || "[]");
      letters = allFeedback.filter(f => f.project_id === currentProject.id);
    } else {
      const { data, error } = await supabaseClient
        .from("partner_feedback")
        .select("*")
        .eq("project_id", currentProject.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      letters = data || [];
    }

    feed.innerHTML = "";
    if (letters.length === 0) {
      feed.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <i data-lucide="heart-handshake" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          <p class="text-sm font-semibold">No feedback letters submitted yet.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    letters.forEach(lettr => {
      const card = document.createElement("div");
      card.className = "p-6 bg-amber-50/70 border border-amber-100 rounded-3xl shadow-sm space-y-3 relative overflow-hidden";
      card.innerHTML = `
        <div class="absolute -top-6 -right-6 w-16 h-16 bg-love-100/20 rounded-full blur-lg"></div>
        <div class="flex justify-between items-center text-xs font-bold text-slate-400 border-b pb-2 mb-2">
          <span class="flex items-center gap-1"><i data-lucide="mail" class="w-4 h-4 text-love-500"></i> Proposal Letter</span>
          <span>${new Date(lettr.created_at).toLocaleString()}</span>
        </div>
        <p class="text-sm italic font-serif text-slate-700 leading-relaxed whitespace-pre-line">${lettr.message}</p>
        <div class="text-right text-xs font-bold text-love-600 border-t pt-2">— Sent by Partner ❤️</div>
      `;
      feed.appendChild(card);
    });
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    showToast("Error loading feedback letters: " + err.message, "error");
  }
}
