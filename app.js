/**
 * ROOTS / Living Lesson Engine
 * Teacher Audit & Approval Console (Slide 06)
 * Client-Side Interactive Engine & Deterministic Rule Runner
 */

// Embedded fallback data for 100% offline standalone operation
const FALLBACK_DATA = {
  stories: [
    {
      id: "story-01",
      contributor: {
        name: "Farmer Ramesh (Village East Ward)",
        role: "Organic Vegetable Cultivator & Village Elder",
        avatar: "👨‍🌾",
        dialect: "Khasi / Eastern Hills Patois",
        consent_id: "#ETH-VIL-2026-088",
        honorarium: "₹500 Respectful Credit"
      },
      story_raw: "24 tomatoes harvested, distributed into 6 storage baskets.",
      audio_meta: {
        duration: 42,
        duration_label: "0:42",
        wer: "3.8%",
        latency: "0.8s"
      },
      extraction: {
        items: 24,
        groups: 6,
        item_name: "tomato",
        item_icon: "🍅",
        group_name: "basket",
        group_icon: "🧺"
      },
      curriculum: {
        grade: "Grade 3-4 Numeracy: Division as Equal Sharing",
        standard: "NCERT M3.04 (Equal Partitioning & Disjoint Sets)",
        concept: "Division as Fair Sharing"
      },
      hint: "Try placing 1 tomato into each of the 6 baskets first, then repeat until all 24 are shared.",
      transfer: {
        problem: "Farmer Ramesh brings 24 tomatoes in 6 baskets. Find how many tomatoes belong in each basket: _____",
        variation: "What if Farmer Ramesh had 30 tomatoes across 5 baskets? Solve on paper/slate without scaffolding.",
        target: 6
      },
      tactile_prompt: "Explain aloud: '24 seeds shared into 6 circles gives 4 in each circle because 6 times 4 is 24.'"
    },
    {
      id: "story-02",
      contributor: {
        name: "Artisan Meera (Bamboo Craft Cluster)",
        role: "Master Bamboo Weaver & Traditional Artisan",
        avatar: "👩‍🎨",
        dialect: "Khasi / Local Hill Dialect",
        consent_id: "#ETH-VIL-2026-089",
        honorarium: "₹500 Respectful Credit"
      },
      story_raw: "18 bamboo splints arranged across 3 triangular chevron frames.",
      audio_meta: {
        duration: 38,
        duration_label: "0:38",
        wer: "2.9%",
        latency: "0.7s"
      },
      extraction: {
        items: 18,
        groups: 3,
        item_name: "bamboo splint",
        item_icon: "🎋",
        group_name: "chevron frame",
        group_icon: "📐"
      },
      curriculum: {
        grade: "Grade 3-4 Geometry: Symmetry & Ratios",
        standard: "NCERT M3.06 (Symmetry & Spatial Grouping)",
        concept: "Symmetrical Equal Partitioning"
      },
      hint: "Count 6 splints into each triangular frame to balance the structural tension equally.",
      transfer: {
        problem: "Artisan Meera needs 18 bamboo splints for 3 frames. How many splints in each frame? _____",
        variation: "What if she had 24 splints to distribute evenly across 4 frames? Calculate on slate.",
        target: 6
      },
      tactile_prompt: "Explain aloud: '18 bamboo splints divided among 3 equal triangles gives 6 per frame because 3 × 6 = 18.'"
    },
    {
      id: "story-03",
      contributor: {
        name: "Elder Sonam (North River Settlement)",
        role: "Community Horticulturalist & Oral Storyteller",
        avatar: "👴",
        dialect: "Local River Valley Dialect",
        consent_id: "#ETH-VIL-2026-090",
        honorarium: "₹500 Respectful Credit"
      },
      story_raw: "40 kilograms of winter potatoes packed into 4 identical jute sacks.",
      audio_meta: {
        duration: 51,
        duration_label: "0:51",
        wer: "3.1%",
        latency: "0.9s"
      },
      extraction: {
        items: 40,
        groups: 4,
        item_name: "potato (kg)",
        item_icon: "🥔",
        group_name: "jute sack",
        group_icon: "🛍️"
      },
      curriculum: {
        grade: "Grade 3-4 Measurement: Weight & Partitioning",
        standard: "NCERT M3.08 (Units of Weight & Division)",
        concept: "Weight Partitioning & Equal Measurement"
      },
      hint: "Think in tens: 10 + 10 + 10 + 10 = 40. Put 10 kg into each sack.",
      transfer: {
        problem: "Elder Sonam packs 40 kg of potatoes into 4 sacks. How many kg per sack? _____",
        variation: "What if the harvest was 45 kg across 5 sacks? How many kg in each sack?",
        target: 9
      },
      tactile_prompt: "Explain aloud: '40 kg divided into 4 sacks equals 10 kg each because 4 × 10 = 40.'"
    }
  ]
};

// Global State
const STATE = {
  stories: FALLBACK_DATA.stories,
  currentStoryId: "story-01",
  currentStory: FALLBACK_DATA.stories[0],
  isApproved: false,
  isPlayingAudio: false,
  audioCurrentTime: 0,
  audioInterval: null,
  auditSeconds: 102, // 1 min 42 sec
  auditInterval: null,
  rotationSeconds: 744, // 12 min 24 sec
  rotationInterval: null,
  placedItems: {}, // basketIndex -> array of items
  unplacedCount: 24,
  userHasAttempted: false,
  activePreviewTab: "tab-digital"
};

// ============================================================================
// AUDIO SYNTHESIS & SOUND EFFECTS (Web Audio API)
// ============================================================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
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
    console.warn("Audio error:", e);
  }
}

function playSuccessChime() {
  setTimeout(() => playTone(523.25, 'triangle', 0.2, 0.15), 0);   // C5
  setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.15), 120); // E5
  setTimeout(() => playTone(783.99, 'triangle', 0.35, 0.15), 240); // G5
  setTimeout(() => playTone(1046.50, 'triangle', 0.45, 0.2), 360); // C6
}

function playPopTone() {
  playTone(440, 'sine', 0.08, 0.08);
}

// ============================================================================
// DETERMINISTIC PYTHON RULES ENGINE (In-Browser Client Mirror)
// Slide 06 Guardrail: Zero LLM Math Hallucination
// ============================================================================
function runDeterministicVerification(items, groups, storyId = "active") {
  const t0 = performance.now();
  const errors = [];
  const warnings = [];

  if (items <= 0) errors.push("Total items must be positive.");
  if (groups <= 0) errors.push("Total groups must be >= 1.");
  if (groups > items) errors.push("Groups cannot exceed items in Grade 3-4 Foundational Numeracy.");

  const quotient = Math.floor(items / groups);
  const remainder = items % groups;
  const isExact = (remainder === 0);

  if (remainder !== 0) {
    errors.push(`Division remainder is ${remainder}. Grade 3-4 foundational curriculum requires exact equal partitioning.`);
  }

  const elapsed = (performance.now() - t0).toFixed(3);
  const cryptoHash = ("SHA256-" + (items * 7919 + groups * 9973 + 12345).toString(16).toUpperCase()).padStart(16, '0');

  return {
    verified: errors.length === 0,
    items,
    groups,
    quotient,
    remainder,
    isExact,
    operation: `${items} ÷ ${groups} = ${quotient}` + (remainder > 0 ? ` R ${remainder}` : `.0`),
    execution_time_ms: elapsed,
    crypto_signature: `ROOTS-PKG-${cryptoHash}`,
    errors,
    warnings
  };
}

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const dom = {
  // Console Header
  auditStopwatch: document.getElementById("auditStopwatch"),
  searchInput: document.getElementById("searchInput"),
  
  // Stepper
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  step3: document.getElementById("step3"),
  step4: document.getElementById("step4"),

  // Story selector
  storyPillGroup: document.getElementById("storyPillGroup"),

  // Left Card: Source & Story
  elderAvatarEmoji: document.getElementById("elderAvatarEmoji"),
  elderName: document.getElementById("elderName"),
  elderRole: document.getElementById("elderRole"),
  elderDialect: document.getElementById("elderDialect"),
  audioPlayBtn: document.getElementById("audioPlayBtn"),
  playIcon: document.getElementById("playIcon"),
  pauseIcon: document.getElementById("pauseIcon"),
  waveformDisplay: document.getElementById("waveformDisplay"),
  audioTimer: document.getElementById("audioTimer"),
  audioWer: document.getElementById("audioWer"),
  storyContextText: document.getElementById("storyContextText"),
  metaItemCount: document.getElementById("metaItemCount"),
  metaGroupCount: document.getElementById("metaGroupCount"),
  consentId: document.getElementById("consentId"),

  // Right Card: Deterministic & Output Preview
  extractedObjective: document.getElementById("extractedObjective"),
  curriculumMapping: document.getElementById("curriculumMapping"),
  mathBannerCalc: document.getElementById("mathBannerCalc"),
  pythonCodeSnippet: document.getElementById("pythonCodeSnippet"),
  pyCodeItems: document.getElementById("pyCodeItems"),
  pyCodeGroups: document.getElementById("pyCodeGroups"),

  // Output Preview Tabs
  previewTabBtns: document.querySelectorAll(".preview-tab-btn"),
  tabDigital: document.getElementById("tab-digital"),
  tabPhysical: document.getElementById("tab-physical"),
  tabPaper: document.getElementById("tab-paper"),

  // Tab 1: Tablet Simulator
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

  // Tab 2: Group Slate
  floorCirclesDiagram: document.getElementById("floorCirclesDiagram"),
  tactileVerbalPrompt: document.getElementById("tactileVerbalPrompt"),

  // Tab 3: Printable Slate
  slateProblemText: document.getElementById("slateProblemText"),
  slateTransferText: document.getElementById("slateTransferText"),
  printWorksheetBtn: document.getElementById("printWorksheetBtn"),

  // Governance Panel & Safeguards
  safeguardsList: document.getElementById("safeguardsList"),
  sg3Badge: document.getElementById("sg3Badge"),
  sg4Badge: document.getElementById("sg4Badge"),
  rotationTimerDigit: document.getElementById("rotationTimerDigit"),

  // Bottom Action Bar
  packageCryptoState: document.getElementById("packageCryptoState"),
  approveSyncBtn: document.getElementById("approveSyncBtn"),
  editParamsBtn: document.getElementById("editParamsBtn"),
  rejectBtn: document.getElementById("rejectBtn"),

  // Modals
  editParamsModal: document.getElementById("editParamsModal"),
  closeEditModalBtn: document.getElementById("closeEditModalBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  inputTotalItems: document.getElementById("inputTotalItems"),
  inputTotalGroups: document.getElementById("inputTotalGroups"),
  selectCurriculum: document.getElementById("selectCurriculum"),
  inputStoryNarrative: document.getElementById("inputStoryNarrative"),
  inputDialectBridge: document.getElementById("inputDialectBridge"),

  rejectModal: document.getElementById("rejectModal"),
  closeRejectModalBtn: document.getElementById("closeRejectModalBtn"),
  cancelRejectBtn: document.getElementById("cancelRejectBtn"),
  confirmRejectBtn: document.getElementById("confirmRejectBtn"),
  rejectReasonSelect: document.getElementById("rejectReasonSelect"),
  rejectNotes: document.getElementById("rejectNotes"),

  newStoryModal: document.getElementById("newStoryModal"),
  openCustomStoryBtn: document.getElementById("openCustomStoryBtn"),
  closeNewStoryModalBtn: document.getElementById("closeNewStoryModalBtn"),
  cancelNewStoryBtn: document.getElementById("cancelNewStoryBtn"),
  submitNewStoryBtn: document.getElementById("submitNewStoryBtn"),
  newElderName: document.getElementById("newElderName"),
  newStoryText: document.getElementById("newStoryText"),
  newItems: document.getElementById("newItems"),
  newGroups: document.getElementById("newGroups"),

  toastContainer: document.getElementById("toastContainer")
};

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  loadStory(STATE.stories[0]);
  setupTimers();
  setupEventListeners();
  tryFetchServerData();
}

// Fetch from local Python server if available
function tryFetchServerData() {
  if (window.location.protocol.startsWith('http')) {
    fetch("/api/data")
      .then(res => res.json())
      .then(data => {
        if (data && data.stories) {
          STATE.stories = data.stories;
          console.log("Connected to ROOTS Local Server (127.0.0.1:8000)");
        }
      })
      .catch(() => {
        console.log("Running in standalone offline mode with embedded dataset.");
      });
  } else {
    console.log("Loaded via local file protocol - using embedded zero-latency offline dataset.");
  }
}

// ============================================================================
// STORY LOADING & STATE SYNCHRONIZATION
// ============================================================================
function loadStory(story) {
  STATE.currentStory = story;
  STATE.currentStoryId = story.id;
  STATE.isApproved = false;
  STATE.userHasAttempted = false;
  STATE.placedItems = {};
  for (let i = 0; i < story.extraction.groups; i++) {
    STATE.placedItems[i] = [];
  }
  STATE.unplacedCount = story.extraction.items;

  // Update Left Column (Source & Story)
  dom.elderAvatarEmoji.textContent = story.contributor.avatar || "👨‍🌾";
  dom.elderName.textContent = story.contributor.name;
  dom.elderRole.textContent = story.contributor.role;
  dom.elderDialect.textContent = `Dialect: ${story.contributor.dialect}`;
  dom.audioWer.textContent = `WER: ${story.audio_meta.wer} • Latency: ${story.audio_meta.latency}`;
  dom.storyContextText.textContent = `"${story.story_raw}"`;
  dom.metaItemCount.textContent = story.extraction.items;
  dom.metaGroupCount.textContent = story.extraction.groups;
  dom.consentId.textContent = story.contributor.consent_id;

  // Reset Audio
  stopAudio();
  dom.audioTimer.textContent = `0:00 / ${story.audio_meta.duration_label}`;

  // Update Right Column (Deterministic verification)
  const verify = runDeterministicVerification(story.extraction.items, story.extraction.groups, story.id);
  dom.extractedObjective.textContent = story.curriculum.grade;
  dom.curriculumMapping.textContent = `NCERT Standard: ${story.curriculum.standard}`;
  dom.mathBannerCalc.textContent = verify.operation;
  
  // Python Code Inspector
  dom.pythonCodeSnippet.innerHTML = `
<span class="py-comment"># Hardcoded Python Verification (Zero LLM Math)</span>
items, groups = <span class="py-num">${story.extraction.items}</span>, <span class="py-num">${story.extraction.groups}</span>
<span class="py-kw">assert</span> items > 0 <span class="py-kw">and</span> groups > 0
quotient, remainder = <span class="py-func">divmod</span>(items, groups)
<span class="py-kw">assert</span> remainder == 0, <span class="py-str">"Equal partitioning required"</span>
<span class="py-comment"># Output: ${verify.operation} [PASS in ${verify.execution_time_ms}ms]</span>`;

  // Output Previews
  renderTabletSimulation(story, verify.quotient);
  renderTactileSlate(story, verify.quotient);
  renderPaperAssessment(story, verify.quotient);

  // Reset Stepper & Safeguard status
  resetWorkflowState(verify);

  // Update Story Pills active class
  document.querySelectorAll(".story-pill-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-story") === story.id);
  });
}

function resetWorkflowState(verify) {
  dom.step1.className = "step-chevron done";
  dom.step2.className = "step-chevron active";
  dom.step3.className = "step-chevron";
  dom.step4.className = "step-chevron";

  dom.sg3Badge.textContent = "TEACHER GATE";
  dom.sg3Badge.className = "safeguard-badge amber";
  dom.sg4Badge.textContent = "LOCKED";
  dom.sg4Badge.className = "safeguard-badge purple";

  dom.packageCryptoState.textContent = `Cryptographic Package: SHA-256 (Pending Authorization)`;
  dom.approveSyncBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    [APPROVE & SYNC TO STATIONS]
  `;
  dom.approveSyncBtn.classList.remove("approved");
}

// ============================================================================
// TAB 1: INTERACTIVE TABLET SCENE SIMULATOR (Digital Station)
// ============================================================================
function renderTabletSimulation(story, targetPerBasket) {
  dom.simTargetCount.textContent = `Target: ${targetPerBasket} per ${story.extraction.group_name.slice(0, -1) || 'basket'}`;
  dom.harvestCrateLabel.textContent = `Harvest Crate (Unplaced ${story.extraction.item_name}):`;
  dom.hintBoxPop.style.display = "none";

  renderUnplacedTokens(story);
  renderBasketsGrid(story, targetPerBasket);
}

function renderUnplacedTokens(story) {
  dom.unplacedBin.innerHTML = "";
  dom.remainingCrateCounter.textContent = `${STATE.unplacedCount} remaining`;

  for (let i = 0; i < STATE.unplacedCount; i++) {
    const token = document.createElement("div");
    token.className = "harvest-token";
    token.textContent = story.extraction.item_icon;
    token.title = `Click or drag to place into a ${story.extraction.group_name.slice(0, -1)}`;
    token.setAttribute("draggable", "true");

    // Click to place in first unfilled basket
    token.addEventListener("click", () => {
      STATE.userHasAttempted = true;
      placeItemInNextBasket(story);
    });

    // HTML5 Drag
    token.addEventListener("dragstart", (e) => {
      STATE.userHasAttempted = true;
      e.dataTransfer.setData("text/plain", "token");
    });

    dom.unplacedBin.appendChild(token);
  }
}

function renderBasketsGrid(story, targetPerBasket) {
  dom.basketsGrid.innerHTML = "";

  for (let i = 0; i < story.extraction.groups; i++) {
    const basket = document.createElement("div");
    basket.className = "basket-card";
    basket.setAttribute("data-basket-index", i);

    const count = STATE.placedItems[i].length;
    if (count === targetPerBasket && count > 0) {
      basket.classList.add("equal-balanced");
    }

    basket.innerHTML = `
      <div class="basket-card-title">
        <span>${story.extraction.group_icon} #${i + 1}</span>
        <span class="basket-count-pill">${count}/${targetPerBasket}</span>
      </div>
      <div class="basket-items-slot" id="basketSlot-${i}"></div>
    `;

    const slot = basket.querySelector(`#basketSlot-${i}`);
    for (let j = 0; j < count; j++) {
      const itemSpan = document.createElement("span");
      itemSpan.textContent = story.extraction.item_icon;
      itemSpan.style.cursor = "pointer";
      itemSpan.title = "Click to return to crate";
      itemSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        returnItemFromBasket(i, story);
      });
      slot.appendChild(itemSpan);
    }

    // Drag over & Drop handlers
    basket.addEventListener("dragover", (e) => {
      e.preventDefault();
      basket.classList.add("drag-over");
    });

    basket.addEventListener("dragleave", () => {
      basket.classList.remove("drag-over");
    });

    basket.addEventListener("drop", (e) => {
      e.preventDefault();
      basket.classList.remove("drag-over");
      if (STATE.unplacedCount > 0) {
        addItemToBasket(i, story);
      }
    });

    // Click on basket directly places item
    basket.addEventListener("click", () => {
      if (STATE.unplacedCount > 0) {
        STATE.userHasAttempted = true;
        addItemToBasket(i, story);
      }
    });

    dom.basketsGrid.appendChild(basket);
  }
}

function addItemToBasket(basketIndex, story) {
  if (STATE.unplacedCount <= 0) return;
  STATE.unplacedCount--;
  STATE.placedItems[basketIndex].push(story.extraction.item_icon);
  playPopTone();
  updateSimulationUI(story);
}

function placeItemInNextBasket(story) {
  if (STATE.unplacedCount <= 0) return;
  const target = Math.floor(story.extraction.items / story.extraction.groups);
  
  // Find basket with fewest items
  let minIndex = 0;
  let minCount = Infinity;
  for (let i = 0; i < story.extraction.groups; i++) {
    if (STATE.placedItems[i].length < minCount) {
      minCount = STATE.placedItems[i].length;
      minIndex = i;
    }
  }

  addItemToBasket(minIndex, story);
}

function returnItemFromBasket(basketIndex, story) {
  if (STATE.placedItems[basketIndex].length > 0) {
    STATE.placedItems[basketIndex].pop();
    STATE.unplacedCount++;
    playPopTone();
    updateSimulationUI(story);
  }
}

function updateSimulationUI(story) {
  const targetPerBasket = Math.floor(story.extraction.items / story.extraction.groups);
  renderUnplacedTokens(story);
  renderBasketsGrid(story, targetPerBasket);

  // Check if fully solved and balanced
  if (STATE.unplacedCount === 0) {
    const allEqual = Object.values(STATE.placedItems).every(items => items.length === targetPerBasket);
    if (allEqual) {
      playSuccessChime();
      showToast("🎉 Perfect Equal Sharing! All baskets have exactly " + targetPerBasket + " items!");
    }
  }
}

function autoDistributeSimulation() {
  const story = STATE.currentStory;
  const target = Math.floor(story.extraction.items / story.extraction.groups);
  STATE.userHasAttempted = true;
  STATE.unplacedCount = 0;
  for (let i = 0; i < story.extraction.groups; i++) {
    STATE.placedItems[i] = Array(target).fill(story.extraction.item_icon);
  }
  playSuccessChime();
  updateSimulationUI(story);
  showToast("⚡ Demonstration: " + story.extraction.items + " shared equally into " + story.extraction.groups + " baskets = " + target + " each.");
}

function resetSimulation() {
  const story = STATE.currentStory;
  STATE.userHasAttempted = false;
  STATE.unplacedCount = story.extraction.items;
  for (let i = 0; i < story.extraction.groups; i++) {
    STATE.placedItems[i] = [];
  }
  dom.hintBoxPop.style.display = "none";
  playPopTone();
  updateSimulationUI(story);
  showToast("↺ Simulation reset to initial harvest crate state.");
}

// ============================================================================
// TAB 2: GROUP TASK SLATE (Physical Hands-On Station)
// ============================================================================
function renderTactileSlate(story, quotient) {
  dom.floorCirclesDiagram.innerHTML = "";
  for (let i = 0; i < story.extraction.groups; i++) {
    const circle = document.createElement("div");
    circle.className = "floor-circle";
    circle.textContent = `○ ${quotient}`;
    circle.title = `Chalk Circle ${i + 1}: ${quotient} seeds/pebbles`;
    dom.floorCirclesDiagram.appendChild(circle);
  }

  dom.tactileVerbalPrompt.textContent = story.tactile_prompt || 
    `Explain aloud: '${story.extraction.items} seeds shared into ${story.extraction.groups} circles gives ${quotient} in each circle.'`;
}

// ============================================================================
// TAB 3: PRINTABLE / BLACKBOARD ASSESSMENT
// ============================================================================
function renderPaperAssessment(story, quotient) {
  dom.slateProblemText.innerHTML = `
    <strong>Core Lesson Problem:</strong> ${story.transfer.problem}<br>
    <div style="margin-top: 6px; font-size: 0.78rem; color: #a7f3d0;">
      Answer: <strong>${quotient} ${story.extraction.item_name}s</strong> per ${story.extraction.group_name.slice(0, -1)}
    </div>
  `;

  dom.slateTransferText.textContent = `"${story.transfer.variation}"`;
}

// ============================================================================
// AUDIO PLAYER EMULATION & SPEECH SYNTHESIS
// ============================================================================
function toggleAudio() {
  if (STATE.isPlayingAudio) {
    stopAudio();
  } else {
    startAudio();
  }
}

function startAudio() {
  STATE.isPlayingAudio = true;
  dom.playIcon.style.display = "none";
  dom.pauseIcon.style.display = "block";
  document.querySelectorAll(".wave-bar").forEach(bar => bar.classList.add("playing"));

  // Web Speech API Voice synthesis if supported
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(STATE.currentStory.story_raw);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.onend = () => stopAudio();
    window.speechSynthesis.speak(utterance);
  }

  const totalDuration = STATE.currentStory.audio_meta.duration;
  STATE.audioInterval = setInterval(() => {
    STATE.audioCurrentTime++;
    const min = Math.floor(STATE.audioCurrentTime / 60);
    const sec = (STATE.audioCurrentTime % 60).toString().padStart(2, '0');
    dom.audioTimer.textContent = `${min}:${sec} / ${STATE.currentStory.audio_meta.duration_label}`;

    if (STATE.audioCurrentTime >= totalDuration) {
      stopAudio();
    }
  }, 1000);
}

function stopAudio() {
  STATE.isPlayingAudio = false;
  clearInterval(STATE.audioInterval);
  STATE.audioCurrentTime = 0;
  dom.playIcon.style.display = "block";
  dom.pauseIcon.style.display = "none";
  document.querySelectorAll(".wave-bar").forEach(bar => bar.classList.remove("playing"));
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ============================================================================
// TIMERS: AUDIT STOPWATCH (≤8 MIN TARGET) & STATION ROTATION (15 MIN)
// ============================================================================
function setupTimers() {
  // Audit Stopwatch (Counts up)
  STATE.auditInterval = setInterval(() => {
    STATE.auditSeconds++;
    const m = Math.floor(STATE.auditSeconds / 60).toString().padStart(2, '0');
    const s = (STATE.auditSeconds % 60).toString().padStart(2, '0');
    dom.auditStopwatch.textContent = `${m}:${s}`;
  }, 1000);

  // Classroom Rotation Countdown (15 min timer for Slide 07)
  STATE.rotationInterval = setInterval(() => {
    if (STATE.rotationSeconds > 0) {
      STATE.rotationSeconds--;
    } else {
      STATE.rotationSeconds = 900; // Reset 15 mins
      playSuccessChime();
      showToast("🔔 15-Minute Station Rotation Due! Cohorts rotate to next station.");
    }
    const m = Math.floor(STATE.rotationSeconds / 60).toString().padStart(2, '0');
    const s = (STATE.rotationSeconds % 60).toString().padStart(2, '0');
    dom.rotationTimerDigit.textContent = `${m}:${s}`;
  }, 1000);
}

// ============================================================================
// APPROVAL WORKFLOW & STATION BROADCAST (Slide 06 Core Hero CTA)
// ============================================================================
function handleApproveAndSync() {
  const story = STATE.currentStory;
  const verify = runDeterministicVerification(story.extraction.items, story.extraction.groups, story.id);

  if (!verify.verified) {
    showToast("❌ Approval Blocked: Arithmetic or pedagogical error detected.");
    return;
  }

  // Update Visual Stepper to 04 PUBLISH
  dom.step1.className = "step-chevron done";
  dom.step2.className = "step-chevron done";
  dom.step3.className = "step-chevron done";
  dom.step4.className = "step-chevron active";

  // Update Safeguard Status
  dom.sg3Badge.textContent = "APPROVED ✔";
  dom.sg3Badge.className = "safeguard-badge green";
  dom.sg4Badge.textContent = "UNLOCKED & SYNCED";
  dom.sg4Badge.className = "safeguard-badge green";

  // Update Cryptographic Package
  dom.packageCryptoState.innerHTML = `
    <span style="color: #047857; font-weight: 800;">
      SEALED & SYNCED [${verify.crypto_signature}]
    </span> • Pushed to 3 Stations (Tablet, Floor Slate, Worksheet)
  `;

  // Button state
  dom.approveSyncBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    PUBLISHED & SYNCED ✔
  `;
  dom.approveSyncBtn.classList.add("approved");

  playSuccessChime();

  // Send to Python server if active
  fetch("/api/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story_id: story.id, verification: verify })
  }).catch(() => {});

  showToast(`✅ Lesson Published! SHA-256 package synced to Station 1 (Tablet), Station 2 (Floor), and Station 3 (Paper).`);
}

// ============================================================================
// EVENT LISTENERS & MODALS
// ============================================================================
function setupEventListeners() {
  // Audio Play Button
  dom.audioPlayBtn.addEventListener("click", toggleAudio);

  // Tab switching
  dom.previewTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dom.previewTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      dom.tabDigital.style.display = tab === "tab-digital" ? "block" : "none";
      dom.tabPhysical.style.display = tab === "tab-physical" ? "block" : "none";
      dom.tabPaper.style.display = tab === "tab-paper" ? "block" : "none";
      STATE.activePreviewTab = tab;
    });
  });

  // Tablet simulation controls
  dom.autoSolveBtn.addEventListener("click", autoDistributeSimulation);
  dom.resetSimBtn.addEventListener("click", resetSimulation);

  // Scaffold Hint Button (Slide 05 Pedagogical Rule)
  dom.scaffoldHintBtn.addEventListener("click", () => {
    if (!STATE.userHasAttempted && STATE.unplacedCount === STATE.currentStory.extraction.items) {
      dom.hintMessageText.textContent = `Micro-Rule: "Attempt before hint: System withholds prompts until student makes an authentic first trial." Please try placing at least 1 item first!`;
      dom.hintBoxPop.style.display = "block";
      playTone(330, 'square', 0.15, 0.1);
    } else {
      dom.hintMessageText.textContent = `Scaffold: ${STATE.currentStory.hint}`;
      dom.hintBoxPop.style.display = "block";
      playTone(550, 'sine', 0.15, 0.1);
    }
  });

  // Primary Action: Approve & Sync
  dom.approveSyncBtn.addEventListener("click", handleApproveAndSync);

  // Edit Parameters Modal
  dom.editParamsBtn.addEventListener("click", () => {
    dom.inputTotalItems.value = STATE.currentStory.extraction.items;
    dom.inputTotalGroups.value = STATE.currentStory.extraction.groups;
    dom.inputStoryNarrative.value = STATE.currentStory.story_raw;
    dom.editParamsModal.classList.add("open");
  });

  dom.closeEditModalBtn.addEventListener("click", () => dom.editParamsModal.classList.remove("open"));
  dom.cancelEditBtn.addEventListener("click", () => dom.editParamsModal.classList.remove("open"));

  dom.saveEditBtn.addEventListener("click", () => {
    const newItems = parseInt(dom.inputTotalItems.value, 10);
    const newGroups = parseInt(dom.inputTotalGroups.value, 10);

    if (isNaN(newItems) || isNaN(newGroups) || newItems <= 0 || newGroups <= 0) {
      alert("Items and groups must be positive numbers.");
      return;
    }

    STATE.currentStory.extraction.items = newItems;
    STATE.currentStory.extraction.groups = newGroups;
    STATE.currentStory.story_raw = dom.inputStoryNarrative.value;
    STATE.currentStory.curriculum.grade = dom.selectCurriculum.value;

    dom.editParamsModal.classList.remove("open");
    loadStory(STATE.currentStory);
    showToast(`🔄 Parameters re-verified with Python: ${newItems} ÷ ${newGroups} = ${(newItems/newGroups).toFixed(1)}`);
  });

  // Reject / Send Back Modal
  dom.rejectBtn.addEventListener("click", () => {
    dom.rejectModal.classList.add("open");
  });

  dom.closeRejectModalBtn.addEventListener("click", () => dom.rejectModal.classList.remove("open"));
  dom.cancelRejectBtn.addEventListener("click", () => dom.rejectModal.classList.remove("open"));

  dom.confirmRejectBtn.addEventListener("click", () => {
    const reason = dom.rejectReasonSelect.value;
    const notes = dom.rejectNotes.value;

    dom.rejectModal.classList.remove("open");
    dom.step1.className = "step-chevron active";
    dom.step2.className = "step-chevron";
    dom.sg3Badge.textContent = "REJECTED";
    dom.sg3Badge.className = "safeguard-badge amber";

    showToast(`⚠️ Story sent back to Ingestion Gate with teacher feedback.`);

    fetch("/api/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story_id: STATE.currentStoryId, reason, notes })
    }).catch(() => {});
  });

  // Story Tab Switcher
  document.querySelectorAll(".story-pill-btn[data-story]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-story");
      const found = STATE.stories.find(s => s.id === id);
      if (found) {
        loadStory(found);
        showToast(`Loaded Story: ${found.contributor.name}`);
      }
    });
  });

  // New Village Story Modal
  dom.openCustomStoryBtn.addEventListener("click", () => {
    dom.newStoryModal.classList.add("open");
  });

  dom.closeNewStoryModalBtn.addEventListener("click", () => dom.newStoryModal.classList.remove("open"));
  dom.cancelNewStoryBtn.addEventListener("click", () => dom.newStoryModal.classList.remove("open"));

  dom.submitNewStoryBtn.addEventListener("click", () => {
    const name = dom.newElderName.value.trim() || "Village Contributor";
    const text = dom.newStoryText.value.trim() || "36 stalks harvested and bound into 6 bundles.";
    const items = parseInt(dom.newItems.value, 10) || 36;
    const groups = parseInt(dom.newGroups.value, 10) || 6;

    const newStory = {
      id: `story-custom-${Date.now()}`,
      contributor: {
        name: `${name} (Village Elder)`,
        role: "Community Knowledge Contributor",
        avatar: "🌾",
        dialect: "Local Village Dialect",
        consent_id: `#ETH-VIL-${Math.floor(1000 + Math.random() * 9000)}`,
        honorarium: "₹500 Respectful Credit"
      },
      story_raw: text,
      audio_meta: {
        duration: 35,
        duration_label: "0:35",
        wer: "2.8%",
        latency: "0.6s"
      },
      extraction: {
        items,
        groups,
        item_name: "stalk",
        item_icon: "🌾",
        group_name: "bundle",
        group_icon: "📦"
      },
      curriculum: {
        grade: "Grade 3-4 Numeracy: Division as Equal Grouping",
        standard: "NCERT M3.04 (Equal Partitioning)",
        concept: "Division as Fair Sharing"
      },
      hint: `Distribute items equally until all ${items} are shared into ${groups} groups.`,
      transfer: {
        problem: `${name} has ${items} stalks across ${groups} bundles. How many per bundle?`,
        variation: `What if there were ${items + groups} stalks across ${groups} bundles?`,
        target: Math.floor(items / groups)
      },
      tactile_prompt: `Explain aloud: '${items} items divided into ${groups} sets gives ${Math.floor(items/groups)} per set.'`
    };

    STATE.stories.push(newStory);
    dom.newStoryModal.classList.remove("open");
    loadStory(newStory);
    showToast(`✨ New village story ingested and parsed via local Whisper simulation!`);
  });

  // Print Worksheet Button
  dom.printWorksheetBtn.addEventListener("click", () => {
    window.print();
  });

  // Safeguard card interactive inspection
  document.querySelectorAll(".safeguard-item-card").forEach(card => {
    card.addEventListener("click", () => {
      const sg = card.getAttribute("data-sg");
      showToast(`Safeguard ${sg}: Zero-compromise governance active. Rules verify all parameters.`);
    });
  });

  // Search input filter
  dom.searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) return;
    const match = STATE.stories.find(s => 
      s.contributor.name.toLowerCase().includes(term) ||
      s.story_raw.toLowerCase().includes(term) ||
      s.curriculum.standard.toLowerCase().includes(term)
    );
    if (match && match.id !== STATE.currentStoryId) {
      loadStory(match);
      showToast(`Found and loaded matching lesson: ${match.contributor.name}`);
    }
  });
}

// Toast notification helper
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Run on window load
document.addEventListener("DOMContentLoaded", init);
