/**
 * ROOTS | Teacher Review & Approval Portal
 * Modern, Professional, Teacher-First Interactive Engine
 * Multi-Space Stepper Navigation (Steps 1, 2, 3, 4)
 * Light Green Aesthetic (IIM Shillong & biTeSys Case Brief)
 */

// Village stories dataset
const STORIES = [
  {
    id: "story-01",
    contributor: {
      name: "Farmer Ramesh (Village East Ward)",
      role: "Organic Vegetable Cultivator & Village Elder",
      avatar: "👨‍🌾",
      dialect: "Khasi / Eastern Hills"
    },
    story_raw: "Farmer Ramesh harvested 24 fresh ripe tomatoes from his terraced hillside plot and distributed them equally across 6 cane baskets.",
    dialect_text: "U nongrep Ramesh u la lum 24 tylli ki soh saw na lyngkha bad u la sam mar ryngkat ha ki 6 tylli ki shang khlem pynkheiñ iano iano.",
    audio_meta: {
      duration: 42,
      duration_label: "0:42",
      wer: "Accuracy: 96.2%"
    },
    items: 24,
    groups: 6,
    item_name: "tomato",
    item_icon: "🍅",
    group_name: "basket",
    group_icon: "🧺",
    curriculum: {
      grade: "Grade 3 Numeracy: Division as Equal Sharing",
      standard: "NCERT Standard M3.04 (Equal Partitioning & Grouping)"
    },
    hint: "Try placing 1 tomato into each of the 6 baskets first, then repeat until your harvest basket is empty.",
    transfer_problem: "Farmer Ramesh brings 24 tomatoes from his field in 6 cane baskets.<br>Draw the tomatoes in each basket and write the answer:<br>Number of tomatoes in each basket = <strong>[ 4 tomatoes ]</strong>",
    transfer_variation: "What if Farmer Ramesh had 30 tomatoes across 5 baskets? Draw and solve on your slate.",
    tactile_prompt: "Have the group say together: '24 seeds divided among 6 circles equals 4 seeds in each circle because 6 times 4 is 24.'"
  },
  {
    id: "story-02",
    contributor: {
      name: "Artisan Meera (Bamboo Craft Cluster)",
      role: "Master Bamboo Weaver & Village Artisan",
      avatar: "👩‍🎨",
      dialect: "Khasi / Hill Craft Dialect"
    },
    story_raw: "Artisan Meera gathered 18 seasoned bamboo splints and arranged them into 3 triangular frames to balance the weaving tension.",
    dialect_text: "Ka Meera ka la lum 18 tylli ki shylliah siej bad ka la pyniaid mar ryngkat ha ki 3 tylli ki dur khyllah ban pynkhlaiñ ia ka thain.",
    audio_meta: {
      duration: 38,
      duration_label: "0:38",
      wer: "Accuracy: 97.1%"
    },
    items: 18,
    groups: 3,
    item_name: "bamboo splint",
    item_icon: "🎋",
    group_name: "frame",
    group_icon: "📐",
    curriculum: {
      grade: "Grade 3-4 Geometry: Symmetry & Spatial Grouping",
      standard: "NCERT Standard M3.06 (Symmetry & Equal Partitioning)"
    },
    hint: "Place 6 bamboo splints along each triangular frame to balance the frame evenly.",
    transfer_problem: "Artisan Meera needs 18 bamboo splints for 3 frames.<br>Number of splints per frame = <strong>[ 6 splints ]</strong>",
    transfer_variation: "What if she had 24 splints to distribute evenly across 4 frames? Calculate on your slate.",
    tactile_prompt: "Have the group say together: '18 bamboo twigs divided into 3 triangles equals 6 twigs in each triangle because 3 times 6 is 18.'"
  },
  {
    id: "story-03",
    contributor: {
      name: "Elder Sonam (North River Settlement)",
      role: "Horticulturalist & Village Storyteller",
      avatar: "👴",
      dialect: "Local River Valley Dialect"
    },
    story_raw: "Elder Sonam harvested 40 kilograms of winter potatoes and packed them into 4 identical jute sacks for transport.",
    dialect_text: "U kpa Sonam u la pynkhreh 40 kilo ki phan tlang bad u la thep mar katjuh ha ki 4 tylli ki pla ba la thain bha.",
    audio_meta: {
      duration: 51,
      duration_label: "0:51",
      wer: "Accuracy: 96.9%"
    },
    items: 40,
    groups: 4,
    item_name: "potato (kg)",
    item_icon: "🥔",
    group_name: "jute sack",
    group_icon: "🛍️",
    curriculum: {
      grade: "Grade 3-4 Measurement: Weight & Fair Sharing",
      standard: "NCERT Standard M3.08 (Units of Weight & Grouping)"
    },
    hint: "Think in tens: 10 + 10 + 10 + 10 = 40. Put 10 kg into each sack.",
    transfer_problem: "Elder Sonam packs 40 kg of potatoes into 4 sacks.<br>Weight in each sack = <strong>[ 10 kg ]</strong>",
    transfer_variation: "What if the harvest was 45 kg across 5 sacks? How many kg in each sack?",
    tactile_prompt: "Have the group say together: '40 kg divided into 4 sacks equals 10 kg in each sack because 4 times 10 is 40.'"
  }
];

// App State
const state = {
  currentStory: STORIES[0],
  unplacedCount: 24,
  placedItems: {},
  isApproved: false,
  isPlayingAudio: false,
  audioSeconds: 0,
  audioTimerInterval: null,
  stopwatchSeconds: 102, // 1 min 42 sec
  rotationSeconds: 744,  // 12 min 24 sec
  isClockPaused: false,
  activeSpace: "space-review"
};

// ============================================================================
// AUDIO SYNTHESIS & SOUND CHIMES
// ============================================================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.15, volume = 0.1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio unavailable:", e);
  }
}

function playSuccessChime() {
  setTimeout(() => playTone(523.25, 'sine', 0.2, 0.15), 0);
  setTimeout(() => playTone(659.25, 'sine', 0.2, 0.15), 100);
  setTimeout(() => playTone(783.99, 'sine', 0.25, 0.15), 200);
  setTimeout(() => playTone(1046.50, 'sine', 0.4, 0.2), 300);
}

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const dom = {
  auditStopwatch: document.getElementById("auditStopwatch"),

  // Stepper Cards
  stepCards: document.querySelectorAll(".step-card"),
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  step3: document.getElementById("step3"),
  step4: document.getElementById("step4"),

  // Dedicated Spaces
  spaces: {
    "space-ingest": document.getElementById("space-ingest"),
    "space-review": document.getElementById("space-review"),
    "space-curriculum": document.getElementById("space-curriculum"),
    "space-classroom": document.getElementById("space-classroom")
  },

  // Space 1: Ingest Elements
  ingestElderAvatar: document.getElementById("ingestElderAvatar"),
  ingestElderName: document.getElementById("ingestElderName"),
  ingestElderRole: document.getElementById("ingestElderRole"),
  ingestElderDialect: document.getElementById("ingestElderDialect"),
  ingestAudioWer: document.getElementById("ingestAudioWer"),
  ingestAudioTimer: document.getElementById("ingestAudioTimer"),
  ingestAudioPlayBtn: document.getElementById("ingestAudioPlayBtn"),
  ingestPlayIcon: document.getElementById("ingestPlayIcon"),
  ingestPauseIcon: document.getElementById("ingestPauseIcon"),
  ingestDialectText: document.getElementById("ingestDialectText"),
  ingestEnglishText: document.getElementById("ingestEnglishText"),
  ingestEntitiesSummary: document.getElementById("ingestEntitiesSummary"),
  nextToReviewBtn: document.getElementById("nextToReviewBtn"),
  goToReviewFromIngestBtn: document.getElementById("goToReviewFromIngestBtn"),

  // Space 2: Review Elements
  elderAvatarEmoji: document.getElementById("elderAvatarEmoji"),
  elderName: document.getElementById("elderName"),
  elderRole: document.getElementById("elderRole"),
  elderDialect: document.getElementById("elderDialect"),
  audioWer: document.getElementById("audioWer"),
  audioPlayBtn: document.getElementById("audioPlayBtn"),
  playIcon: document.getElementById("playIcon"),
  pauseIcon: document.getElementById("pauseIcon"),
  audioTimer: document.getElementById("audioTimer"),
  storyContextText: document.getElementById("storyContextText"),

  extractedObjective: document.getElementById("extractedObjective"),
  curriculumMapping: document.getElementById("curriculumMapping"),
  mathBannerCalc: document.getElementById("mathBannerCalc"),
  mathExplanation: document.getElementById("mathExplanation"),
  summaryItems: document.getElementById("summaryItems"),
  summaryGroups: document.getElementById("summaryGroups"),

  tabDigital: document.getElementById("tab-digital"),
  tabPhysical: document.getElementById("tab-physical"),
  tabPaper: document.getElementById("tab-paper"),
  tabBtns: document.querySelectorAll(".tab-btn-clean"),

  simTargetCount: document.getElementById("simTargetCount"),
  harvestCrateLabel: document.getElementById("harvestCrateLabel"),
  remainingCrateCounter: document.getElementById("remainingCrateCounter"),
  unplacedBin: document.getElementById("unplacedBin"),
  basketsGrid: document.getElementById("basketsGrid"),
  scaffoldHintBtn: document.getElementById("scaffoldHintBtn"),
  autoSolveBtn: document.getElementById("autoSolveBtn"),
  resetSimBtn: document.getElementById("resetSimBtn"),
  hintBoxPop: document.getElementById("hintBoxPop"),
  hintMessageText: document.getElementById("hintMessageText"),

  floorCirclesDiagram: document.getElementById("floorCirclesDiagram"),
  tactileVerbalPrompt: document.getElementById("tactileVerbalPrompt"),

  slateProblemText: document.getElementById("slateProblemText"),
  slateTransferText: document.getElementById("slateTransferText"),
  printWorksheetBtn: document.getElementById("printWorksheetBtn"),

  actionStatusDot: document.getElementById("actionStatusDot"),
  actionStatusTitle: document.getElementById("actionStatusTitle"),
  actionStatusSub: document.getElementById("actionStatusSub"),
  approveSyncBtn: document.getElementById("approveSyncBtn"),
  editParamsBtn: document.getElementById("editParamsBtn"),
  rejectBtn: document.getElementById("rejectBtn"),

  sg3Item: document.getElementById("sg3Item"),
  sg3Icon: document.getElementById("sg3Icon"),
  sg3Desc: document.getElementById("sg3Desc"),
  sg4Item: document.getElementById("sg4Item"),
  sg4Icon: document.getElementById("sg4Icon"),
  sg4Desc: document.getElementById("sg4Desc"),
  rotationTimerDigit: document.getElementById("rotationTimerDigit"),

  backToIngestBtn: document.getElementById("backToIngestBtn"),
  nextToCurriculumBtn: document.getElementById("nextToCurriculumBtn"),

  // Space 3: Curriculum Nav
  backToReviewFromCurrBtn: document.getElementById("backToReviewFromCurrBtn"),
  nextToClassroomBtn: document.getElementById("nextToClassroomBtn"),

  // Space 4: Classroom Nav & Controls
  masterClockDisplay: document.getElementById("masterClockDisplay"),
  pauseClockBtn: document.getElementById("pauseClockBtn"),
  resetClockBtn: document.getElementById("resetClockBtn"),
  backToCurrFromClassBtn: document.getElementById("backToCurrFromClassBtn"),
  returnToReviewBtn: document.getElementById("returnToReviewBtn"),
  jumpToTabletFromClassBtn: document.getElementById("jumpToTabletFromClassBtn"),
  jumpToFloorFromClassBtn: document.getElementById("jumpToFloorFromClassBtn"),
  printFromClassroomBtn: document.getElementById("printFromClassroomBtn"),

  // Modals
  editParamsModal: document.getElementById("editParamsModal"),
  closeEditModalBtn: document.getElementById("closeEditModalBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  inputTotalItems: document.getElementById("inputTotalItems"),
  inputTotalGroups: document.getElementById("inputTotalGroups"),
  inputStoryNarrative: document.getElementById("inputStoryNarrative"),

  rejectModal: document.getElementById("rejectModal"),
  closeRejectModalBtn: document.getElementById("closeRejectModalBtn"),
  cancelRejectBtn: document.getElementById("cancelRejectBtn"),
  confirmRejectBtn: document.getElementById("confirmRejectBtn"),

  newStoryModal: document.getElementById("newStoryModal"),
  openCustomStoryBtn: document.getElementById("openCustomStoryBtn"),
  closeNewStoryModalBtn: document.getElementById("closeNewStoryModalBtn"),
  cancelNewStoryBtn: document.getElementById("cancelNewStoryBtn"),
  submitNewStoryBtn: document.getElementById("submitNewStoryBtn"),
  newElderName: document.getElementById("newElderName"),
  newStoryText: document.getElementById("newStoryText"),
  newItems: document.getElementById("newItems"),
  newGroups: document.getElementById("newGroups")
};

// ============================================================================
// NAVIGATION & SPACE SWITCHING
// ============================================================================
function switchSpace(spaceId) {
  if (!dom.spaces[spaceId]) return;
  state.activeSpace = spaceId;

  // Toggle active class on views
  Object.keys(dom.spaces).forEach(id => {
    dom.spaces[id].classList.toggle("active", id === spaceId);
  });

  // Update Stepper Cards active indicator
  dom.stepCards.forEach(card => {
    const cardSpace = card.getAttribute("data-space");
    card.classList.toggle("active", cardSpace === spaceId);
  });

  // Smooth scroll to top of workspace
  window.scrollTo({ top: 180, behavior: 'smooth' });

  // Update hash
  const hash = spaceId.replace("space-", "");
  if (history.replaceState) {
    history.replaceState(null, null, `#${hash}`);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  loadStory(state.currentStory);
  setupTimers();
  setupEventListeners();

  // Check URL hash on load
  const hash = window.location.hash.replace("#", "");
  if (hash && dom.spaces[`space-${hash}`]) {
    switchSpace(`space-${hash}`);
  } else {
    switchSpace("space-review");
  }
}

function loadStory(story) {
  state.currentStory = story;
  state.isApproved = false;
  state.unplacedCount = story.items;
  state.placedItems = {};
  for (let i = 0; i < story.groups; i++) {
    state.placedItems[i] = [];
  }

  const pluralItem = (story.item_name === "tomato") ? "tomatoes" : (story.item_name === "potato (kg)") ? "kg potatoes" : `${story.item_name}s`;
  const pluralGroup = (story.group_name === "frame") ? "frames" : (story.group_name === "jute sack") ? "jute sacks" : `${story.group_name}s`;

  // Update Space 1: Ingest Elements
  dom.ingestElderAvatar.textContent = story.contributor.avatar;
  dom.ingestElderName.textContent = story.contributor.name;
  dom.ingestElderRole.textContent = story.contributor.role;
  dom.ingestElderDialect.textContent = `Dialect: ${story.contributor.dialect}`;
  dom.ingestAudioWer.textContent = story.audio_meta.wer;
  dom.ingestAudioTimer.textContent = `0:00 / ${story.audio_meta.duration_label}`;
  dom.ingestDialectText.textContent = `"${story.dialect_text || story.story_raw}"`;
  dom.ingestEnglishText.textContent = `"${story.story_raw}"`;
  dom.ingestEntitiesSummary.textContent = `${story.items} ${pluralItem} partitioned across ${story.groups} ${pluralGroup} (Equal Sharing)`;

  // Update Space 2: Review Elements
  dom.elderAvatarEmoji.textContent = story.contributor.avatar;
  dom.elderName.textContent = story.contributor.name;
  dom.elderRole.textContent = story.contributor.role;
  dom.elderDialect.textContent = `Dialect: ${story.contributor.dialect}`;
  dom.audioWer.textContent = story.audio_meta.wer;
  dom.storyContextText.textContent = `"${story.story_raw}"`;
  dom.audioTimer.textContent = `0:00 / ${story.audio_meta.duration_label}`;
  stopAudio();

  const quotient = Math.floor(story.items / story.groups);
  const remainder = story.items % story.groups;

  dom.extractedObjective.textContent = story.curriculum.grade;
  dom.curriculumMapping.textContent = story.curriculum.standard;

  if (remainder === 0) {
    dom.mathBannerCalc.textContent = `${story.items} ÷ ${story.groups} = ${quotient} ${pluralItem} per ${story.group_name}`;
    dom.mathExplanation.textContent = `Equal sharing confirmed: ${story.items} items divided into ${story.groups} equal groups leaves 0 remainder. Perfect for foundational Class 3 math.`;
  } else {
    dom.mathBannerCalc.textContent = `${story.items} ÷ ${story.groups} = ${quotient} (Remainder ${remainder})`;
    dom.mathExplanation.textContent = `Notice: Leaves a remainder of ${remainder}. You can adjust numbers using the Edit button below for exact sharing.`;
  }

  dom.summaryItems.textContent = `${story.items} ${pluralItem}`;
  dom.summaryGroups.textContent = `${story.groups} ${pluralGroup}`;

  // Previews
  renderTabletSimulation(story, quotient);
  renderFloorLesson(story, quotient);
  renderWorksheet(story, quotient);

  // Reset Approval Status
  resetApprovalUI();

  // Story selector button active styling
  document.querySelectorAll(".story-pill-btn[data-story]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-story") === story.id);
  });
}

function resetApprovalUI() {
  dom.step1.className = "step-card done";
  dom.step2.className = "step-card active";
  dom.step3.className = "step-card";
  dom.step4.className = "step-card";

  dom.sg3Item.className = "check-item pending";
  dom.sg3Icon.textContent = "⏳";
  dom.sg3Desc.textContent = "Waiting for your sign-off as the classroom teacher.";

  dom.sg4Item.className = "check-item pending";
  dom.sg4Icon.textContent = "🔒";
  dom.sg4Desc.textContent = "Locked until you approve. Tablets cannot show unreviewed lessons.";

  dom.actionStatusDot.className = "action-status-dot";
  dom.actionStatusTitle.textContent = "Review Pending Teacher Approval";
  dom.actionStatusSub.textContent = "Click approve to sync this lesson to student tablets and blackboard guides.";

  dom.approveSyncBtn.innerHTML = `✓ Approve & Send to Classroom`;
  dom.approveSyncBtn.style.background = "";
}

// ============================================================================
// TAB 1: TABLET SIMULATION (Interactive Manipulative)
// ============================================================================
function renderTabletSimulation(story, targetPerBasket) {
  const pluralItem = (story.item_name === "tomato") ? "tomatoes" : (story.item_name === "potato (kg)") ? "kg potatoes" : `${story.item_name}s`;
  dom.simTargetCount.textContent = `Target: ${targetPerBasket} per ${story.group_name}`;
  dom.harvestCrateLabel.textContent = `Harvest Basket (Unplaced ${pluralItem}):`;
  dom.hintBoxPop.style.display = "none";

  renderCrateItems(story);
  renderBaskets(story, targetPerBasket);
}

function renderCrateItems(story) {
  dom.unplacedBin.innerHTML = "";
  dom.remainingCrateCounter.textContent = `${state.unplacedCount} remaining`;

  for (let i = 0; i < state.unplacedCount; i++) {
    const token = document.createElement("div");
    token.className = "draggable-item";
    token.textContent = story.item_icon;
    token.title = `Click to place into next basket`;

    token.addEventListener("click", () => {
      placeInNextBasket(story);
    });

    dom.unplacedBin.appendChild(token);
  }
}

function renderBaskets(story, targetPerBasket) {
  dom.basketsGrid.innerHTML = "";

  for (let i = 0; i < story.groups; i++) {
    const basket = document.createElement("div");
    basket.className = "basket-unit";
    const count = state.placedItems[i].length;

    if (count === targetPerBasket && count > 0) {
      basket.classList.add("complete");
    }

    basket.innerHTML = `
      <div class="basket-top-label">
        <span>${story.group_icon} Basket #${i + 1}</span>
        <span class="basket-count-pill">${count}/${targetPerBasket}</span>
      </div>
      <div class="basket-token-holder" id="basketItems-${i}"></div>
    `;

    const holder = basket.querySelector(`#basketItems-${i}`);
    for (let j = 0; j < count; j++) {
      const item = document.createElement("span");
      item.textContent = story.item_icon;
      item.style.fontSize = "1.2rem";
      item.style.cursor = "pointer";
      item.title = "Click to remove from basket";
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        removeFromBasket(i, story);
      });
      holder.appendChild(item);
    }

    basket.addEventListener("click", () => {
      if (state.unplacedCount > 0) {
        addToBasket(i, story);
      }
    });

    dom.basketsGrid.appendChild(basket);
  }
}

function addToBasket(index, story) {
  if (state.unplacedCount <= 0) return;
  state.unplacedCount--;
  state.placedItems[index].push(story.item_icon);
  playTone(520, 'sine', 0.08, 0.08);
  updateTabletUI(story);
}

function removeFromBasket(index, story) {
  if (state.placedItems[index].length > 0) {
    state.placedItems[index].pop();
    state.unplacedCount++;
    playTone(400, 'sine', 0.08, 0.08);
    updateTabletUI(story);
  }
}

function placeInNextBasket(story) {
  if (state.unplacedCount <= 0) return;
  let minIndex = 0;
  let minCount = Infinity;
  for (let i = 0; i < story.groups; i++) {
    if (state.placedItems[i].length < minCount) {
      minCount = state.placedItems[i].length;
      minIndex = i;
    }
  }
  addToBasket(minIndex, story);
}

function updateTabletUI(story) {
  const target = Math.floor(story.items / story.groups);
  renderCrateItems(story);
  renderBaskets(story, target);

  if (state.unplacedCount === 0) {
    const allEqual = Object.values(state.placedItems).every(items => items.length === target);
    if (allEqual) {
      playSuccessChime();
      showToast(`🌟 Equal Sharing Complete! All ${story.groups} baskets have ${target} items each!`);
    }
  }
}

function autoFillSimulation() {
  const story = state.currentStory;
  const target = Math.floor(story.items / story.groups);
  state.unplacedCount = 0;
  for (let i = 0; i < story.groups; i++) {
    state.placedItems[i] = Array(target).fill(story.item_icon);
  }
  playSuccessChime();
  updateTabletUI(story);
  showToast(`⚡ Filled: ${story.items} shared equally across ${story.groups} baskets = ${target} each.`);
}

function resetSimulation() {
  const story = state.currentStory;
  state.unplacedCount = story.items;
  for (let i = 0; i < story.groups; i++) {
    state.placedItems[i] = [];
  }
  dom.hintBoxPop.style.display = "none";
  playTone(380, 'sine', 0.1, 0.1);
  updateTabletUI(story);
  showToast("↺ Tablet simulation reset.");
}

// ============================================================================
// TAB 2: FLOOR LESSON & TAB 3: WORKSHEET
// ============================================================================
function renderFloorLesson(story, quotient) {
  dom.floorCirclesDiagram.innerHTML = "";
  for (let i = 0; i < story.groups; i++) {
    const circle = document.createElement("div");
    circle.className = "chalk-circle-item";
    circle.innerHTML = `<span>Circle #${i + 1}</span><strong>${quotient}</strong>`;
    dom.floorCirclesDiagram.appendChild(circle);
  }
  dom.tactileVerbalPrompt.textContent = story.tactile_prompt;
}

function renderWorksheet(story, quotient) {
  dom.slateProblemText.innerHTML = story.transfer_problem;
  dom.slateTransferText.textContent = `"${story.transfer_variation}"`;
}

// ============================================================================
// AUDIO RECORDING PLAYBACK
// ============================================================================
function toggleAudio() {
  if (state.isPlayingAudio) {
    stopAudio();
  } else {
    startAudio();
  }
}

function startAudio() {
  state.isPlayingAudio = true;
  // Update both buttons
  dom.playIcon.style.display = "none";
  dom.pauseIcon.style.display = "block";
  if (dom.ingestPlayIcon) dom.ingestPlayIcon.style.display = "none";
  if (dom.ingestPauseIcon) dom.ingestPauseIcon.style.display = "block";

  document.querySelectorAll(".wave-stick").forEach(w => w.classList.add("active"));

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(state.currentStory.story_raw);
    utt.rate = 0.95;
    utt.onend = () => stopAudio();
    window.speechSynthesis.speak(utt);
  }

  const maxSec = state.currentStory.audio_meta.duration;
  state.audioTimerInterval = setInterval(() => {
    state.audioSeconds++;
    const m = Math.floor(state.audioSeconds / 60);
    const s = (state.audioSeconds % 60).toString().padStart(2, '0');
    const timeStr = `${m}:${s} / ${state.currentStory.audio_meta.duration_label}`;
    dom.audioTimer.textContent = timeStr;
    if (dom.ingestAudioTimer) dom.ingestAudioTimer.textContent = timeStr;
    if (state.audioSeconds >= maxSec) stopAudio();
  }, 1000);
}

function stopAudio() {
  state.isPlayingAudio = false;
  clearInterval(state.audioTimerInterval);
  state.audioSeconds = 0;
  dom.playIcon.style.display = "block";
  dom.pauseIcon.style.display = "none";
  if (dom.ingestPlayIcon) dom.ingestPlayIcon.style.display = "block";
  if (dom.ingestPauseIcon) dom.ingestPauseIcon.style.display = "none";

  document.querySelectorAll(".wave-stick").forEach(w => w.classList.remove("active"));
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ============================================================================
// TIMERS
// ============================================================================
function setupTimers() {
  // Review Stopwatch
  setInterval(() => {
    state.stopwatchSeconds++;
    const m = Math.floor(state.stopwatchSeconds / 60).toString().padStart(2, '0');
    const s = (state.stopwatchSeconds % 60).toString().padStart(2, '0');
    dom.auditStopwatch.textContent = `${m}:${s}`;
  }, 1000);

  // 15-Minute Station Rotation
  setInterval(() => {
    if (!state.isClockPaused) {
      if (state.rotationSeconds > 0) {
        state.rotationSeconds--;
      } else {
        state.rotationSeconds = 900;
        playSuccessChime();
        showToast("🔔 15-Minute Station Rotation Time! Cohorts switch stations.");
      }
      const m = Math.floor(state.rotationSeconds / 60).toString().padStart(2, '0');
      const s = (state.rotationSeconds % 60).toString().padStart(2, '0');
      const timeStr = `${m}:${s}`;
      dom.rotationTimerDigit.textContent = timeStr;
      if (dom.masterClockDisplay) dom.masterClockDisplay.textContent = timeStr;
    }
  }, 1000);
}

// ============================================================================
// TEACHER APPROVAL ACTION
// ============================================================================
function approveLesson() {
  state.isApproved = true;

  dom.step1.className = "step-card done";
  dom.step2.className = "step-card done";
  dom.step3.className = "step-card done";
  dom.step4.className = "step-card active";

  dom.sg3Item.className = "check-item";
  dom.sg3Icon.textContent = "✓";
  dom.sg3Desc.textContent = "Signed off by Teacher Ananya. Verified for Class 3.";

  dom.sg4Item.className = "check-item";
  dom.sg4Icon.textContent = "✓";
  dom.sg4Desc.textContent = "Unlocked & Synced! Station 1 Tablet, Station 2 Floor & Blackboard Ready.";

  dom.actionStatusDot.className = "action-status-dot approved";
  dom.actionStatusTitle.textContent = "Lesson Approved & Sent to Classroom";
  dom.actionStatusSub.textContent = "Active across Station 1 (Tablet), Station 2 (Floor Seeds) & Station 3 (Blackboard).";

  dom.approveSyncBtn.innerHTML = `✓ Lesson Active in Classroom`;
  dom.approveSyncBtn.style.background = "#15803d";

  playSuccessChime();
  showToast("🎉 Lesson Approved! Sent to student tablet and blackboard guides.");
}

// ============================================================================
// EVENT LISTENERS & MODALS
// ============================================================================
function setupEventListeners() {
  // Stepper Cards Click -> Navigate to Space
  dom.stepCards.forEach(card => {
    card.addEventListener("click", () => {
      const space = card.getAttribute("data-space");
      switchSpace(space);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const space = card.getAttribute("data-space");
        switchSpace(space);
      }
    });
  });

  // Space 1 Nav Buttons
  if (dom.nextToReviewBtn) {
    dom.nextToReviewBtn.addEventListener("click", () => switchSpace("space-review"));
  }
  if (dom.goToReviewFromIngestBtn) {
    dom.goToReviewFromIngestBtn.addEventListener("click", () => switchSpace("space-review"));
  }

  // Space 2 Nav Buttons
  if (dom.backToIngestBtn) {
    dom.backToIngestBtn.addEventListener("click", () => switchSpace("space-ingest"));
  }
  if (dom.nextToCurriculumBtn) {
    dom.nextToCurriculumBtn.addEventListener("click", () => switchSpace("space-curriculum"));
  }

  // Space 3 Nav Buttons
  if (dom.backToReviewFromCurrBtn) {
    dom.backToReviewFromCurrBtn.addEventListener("click", () => switchSpace("space-review"));
  }
  if (dom.nextToClassroomBtn) {
    dom.nextToClassroomBtn.addEventListener("click", () => switchSpace("space-classroom"));
  }

  // Space 4 Nav Buttons & Controller
  if (dom.backToCurrFromClassBtn) {
    dom.backToCurrFromClassBtn.addEventListener("click", () => switchSpace("space-curriculum"));
  }
  if (dom.returnToReviewBtn) {
    dom.returnToReviewBtn.addEventListener("click", () => switchSpace("space-review"));
  }
  if (dom.jumpToTabletFromClassBtn) {
    dom.jumpToTabletFromClassBtn.addEventListener("click", () => {
      switchSpace("space-review");
      dom.tabBtns[0].click();
    });
  }
  if (dom.jumpToFloorFromClassBtn) {
    dom.jumpToFloorFromClassBtn.addEventListener("click", () => {
      switchSpace("space-review");
      dom.tabBtns[1].click();
    });
  }
  if (dom.printFromClassroomBtn) {
    dom.printFromClassroomBtn.addEventListener("click", () => window.print());
  }

  // Clock Controls
  if (dom.pauseClockBtn) {
    dom.pauseClockBtn.addEventListener("click", () => {
      state.isClockPaused = !state.isClockPaused;
      dom.pauseClockBtn.textContent = state.isClockPaused ? "▶ Resume Timer" : "⏸ Pause Timer";
      showToast(state.isClockPaused ? "Station timer paused." : "Station timer resumed.");
    });
  }
  if (dom.resetClockBtn) {
    dom.resetClockBtn.addEventListener("click", () => {
      state.rotationSeconds = 900;
      dom.rotationTimerDigit.textContent = "15:00";
      dom.masterClockDisplay.textContent = "15:00";
      showToast("Station rotation timer reset to 15:00.");
    });
  }

  // Audio Play Buttons (both Space 1 and Space 2)
  dom.audioPlayBtn.addEventListener("click", toggleAudio);
  if (dom.ingestAudioPlayBtn) {
    dom.ingestAudioPlayBtn.addEventListener("click", toggleAudio);
  }

  // Preview Tabs (Inside Space 2)
  dom.tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dom.tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      dom.tabDigital.style.display = tab === "tab-digital" ? "block" : "none";
      dom.tabPhysical.style.display = tab === "tab-physical" ? "block" : "none";
      dom.tabPaper.style.display = tab === "tab-paper" ? "block" : "none";
    });
  });

  // Tablet Controls
  dom.autoSolveBtn.addEventListener("click", autoFillSimulation);
  dom.resetSimBtn.addEventListener("click", resetSimulation);
  dom.scaffoldHintBtn.addEventListener("click", () => {
    dom.hintMessageText.textContent = state.currentStory.hint;
    dom.hintBoxPop.style.display = "block";
    playTone(600, 'sine', 0.12, 0.1);
  });

  // Approval CTA
  dom.approveSyncBtn.addEventListener("click", approveLesson);

  // Edit Modal
  dom.editParamsBtn.addEventListener("click", () => {
    dom.inputTotalItems.value = state.currentStory.items;
    dom.inputTotalGroups.value = state.currentStory.groups;
    dom.inputStoryNarrative.value = state.currentStory.story_raw;
    dom.editParamsModal.classList.add("open");
  });

  dom.closeEditModalBtn.addEventListener("click", () => dom.editParamsModal.classList.remove("open"));
  dom.cancelEditBtn.addEventListener("click", () => dom.editParamsModal.classList.remove("open"));

  dom.saveEditBtn.addEventListener("click", () => {
    const items = parseInt(dom.inputTotalItems.value, 10);
    const groups = parseInt(dom.inputTotalGroups.value, 10);
    if (isNaN(items) || isNaN(groups) || items <= 0 || groups <= 0) {
      alert("Please enter valid positive numbers.");
      return;
    }

    state.currentStory.items = items;
    state.currentStory.groups = groups;
    state.currentStory.story_raw = dom.inputStoryNarrative.value;
    dom.editParamsModal.classList.remove("open");
    loadStory(state.currentStory);
    showToast(`✓ Updated: ${items} items into ${groups} groups.`);
  });

  // Reject Modal
  dom.rejectBtn.addEventListener("click", () => {
    dom.rejectModal.classList.add("open");
  });

  dom.closeRejectModalBtn.addEventListener("click", () => dom.rejectModal.classList.remove("open"));
  dom.cancelRejectBtn.addEventListener("click", () => dom.rejectModal.classList.remove("open"));

  dom.confirmRejectBtn.addEventListener("click", () => {
    dom.rejectModal.classList.remove("open");
    dom.step1.className = "step-card active";
    dom.step2.className = "step-card";
    dom.actionStatusTitle.textContent = "Sent Back to Recorder for Revisions";
    dom.actionStatusSub.textContent = "Feedback has been documented for the community recorder.";
    showToast("Feedback sent to village recorder for story adjustment.");
  });

  // Story Switcher
  document.querySelectorAll(".story-pill-btn[data-story]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-story");
      const found = STORIES.find(s => s.id === id);
      if (found) loadStory(found);
    });
  });

  // Ingest New Story Modal
  dom.openCustomStoryBtn.addEventListener("click", () => dom.newStoryModal.classList.add("open"));
  dom.closeNewStoryModalBtn.addEventListener("click", () => dom.newStoryModal.classList.remove("open"));
  dom.cancelNewStoryBtn.addEventListener("click", () => dom.newStoryModal.classList.remove("open"));

  dom.submitNewStoryBtn.addEventListener("click", () => {
    const name = dom.newElderName.value.trim() || "Village Elder";
    const text = dom.newStoryText.value.trim() || "Harvested 36 items and shared them across 6 baskets.";
    const items = parseInt(dom.newItems.value, 10) || 36;
    const groups = parseInt(dom.newGroups.value, 10) || 6;

    const newStory = {
      id: `story-${Date.now()}`,
      contributor: {
        name: `${name} (Village Elder)`,
        role: "Community Knowledge Contributor",
        avatar: "🌾",
        dialect: "Local Village Dialect"
      },
      story_raw: text,
      dialect_text: text,
      audio_meta: { duration: 35, duration_label: "0:35", wer: "Accuracy: 97.5%" },
      items,
      groups,
      item_name: "item",
      item_icon: "🌾",
      group_name: "bundle",
      group_icon: "📦",
      curriculum: {
        grade: "Grade 3 Numeracy: Equal Grouping",
        standard: "NCERT Standard M3.04 (Equal Partitioning)"
      },
      hint: `Try sharing items equally into ${groups} groups.`,
      transfer_problem: `${name} has ${items} items in ${groups} bundles.<br>Number per bundle = <strong>[ ${Math.floor(items/groups)} ]</strong>`,
      transfer_variation: `What if there were ${items + groups} items across ${groups} bundles? Solve on slate.`,
      tactile_prompt: `Have the group say together: '${items} divided into ${groups} equals ${Math.floor(items/groups)}.'`
    };

    STORIES.push(newStory);
    dom.newStoryModal.classList.remove("open");
    loadStory(newStory);
    showToast("✨ New village story ingested and ready for review!");
  });

  // Print Worksheet
  dom.printWorksheetBtn.addEventListener("click", () => {
    window.print();
  });
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast-box";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity 0.3s";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

document.addEventListener("DOMContentLoaded", init);
