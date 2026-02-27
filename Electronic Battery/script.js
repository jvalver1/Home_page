const MAX_PARTICLES_LIMIT = 240;
const DEFAULT_THEME = 'warm';
const DEFAULT_SETTINGS = {
  swirlStrength: 0.06,
  pullStrengthNear: 0.018,
  damping: 0.96,
  wobble: 0.35,
  spawnRate: 1,
  particleSize: 1,
  maxParticles: 120
};

// ==================== DRUM MACHINE CONSTANTS ====================

// Using synthetic drums - no external files needed!
const DRUM_NAMES = ['Kick', 'Snare', 'Hi-Hat', 'Hi-Hat Open', 'Tom High', 'Tom Mid', 'Tom Low', 'Crash', 'Ride'];
const DRUM_COLORS = [
  [0, 80, 100],      // Kick - red
  [30, 85, 100],     // Snare - orange
  [60, 75, 100],     // Hi-Hat - yellow
  [80, 70, 100],     // Hi-Hat Open - yellow-green
  [150, 60, 100],    // Tom High - cyan
  [180, 65, 100],    // Tom Mid - blue-cyan
  [210, 70, 100],    // Tom Low - blue
  [280, 75, 100],    // Crash - purple
  [320, 70, 100]     // Ride - magenta
];

const drummachineState = {
  currentDrum: 0,
  gridSteps: 16,
  bpm: 120,
  sequence: {}, // { drumIndex: [step1, step2, ...] }
  synths: {}, // Will hold synthetic drum instruments
  isPlaying: false,
  currentStep: 0,
  visualSequence: [], // [{x, y, drumIndex, step}]
  samplesLoaded: true, // Synths are always ready
  sequenceLoop: null
};

// ==================== PARTICLE ENGINE ====================

const particles = [];
let mouse = { x: 0, y: 0, px: 0, py: 0 };
let activeTheme = DEFAULT_THEME;
const settings = { ...DEFAULT_SETTINGS };

const PRESETS = {
  calm: {
    swirlStrength: 0.04,
    pullStrengthNear: 0.014,
    damping: 0.975,
    wobble: 0.2,
    spawnRate: 0.7,
    particleSize: 0.9,
    maxParticles: 90
  },
  balanced: {
    ...DEFAULT_SETTINGS
  },
  energetic: {
    swirlStrength: 0.095,
    pullStrengthNear: 0.028,
    damping: 0.93,
    wobble: 0.55,
    spawnRate: 1.8,
    particleSize: 1.2,
    maxParticles: 180
  }
};

const THEMES = {
  warm: {
    bg: [18, 62, 10, 22],
    hueBase: 24,
    depthShiftRange: [-14, 16],
    nearFarShiftRange: [12, -8],
    satRange: [45, 92],
    briRange: [60, 100]
  },
  cold: {
    bg: [210, 55, 8, 22],
    hueBase: 194,
    depthShiftRange: [-18, 20],
    nearFarShiftRange: [20, -10],
    satRange: [40, 90],
    briRange: [55, 100]
  }
};

const contextMenu = document.getElementById('context-menu');
const togglePaletteButton = document.getElementById('toggle-palette');
const presetCalmButton = document.getElementById('preset-calm');
const presetBalancedButton = document.getElementById('preset-balanced');
const presetEnergeticButton = document.getElementById('preset-energetic');
const resetAllButton = document.getElementById('reset-all');

const controls = {
  swirlStrength: {
    input: document.getElementById('swirl-control'),
    output: document.getElementById('swirl-value'),
    format: (value) => Number(value).toFixed(3)
  },
  pullStrengthNear: {
    input: document.getElementById('pull-control'),
    output: document.getElementById('pull-value'),
    format: (value) => Number(value).toFixed(3)
  },
  damping: {
    input: document.getElementById('damping-control'),
    output: document.getElementById('damping-value'),
    format: (value) => Number(value).toFixed(3)
  },
  wobble: {
    input: document.getElementById('wobble-control'),
    output: document.getElementById('wobble-value'),
    format: (value) => Number(value).toFixed(2)
  },
  spawnRate: {
    input: document.getElementById('spawn-control'),
    output: document.getElementById('spawn-value'),
    format: (value) => `${Number(value).toFixed(1)}x`
  },
  particleSize: {
    input: document.getElementById('size-control'),
    output: document.getElementById('size-value'),
    format: (value) => `${Number(value).toFixed(2)}x`
  },
  maxParticles: {
    input: document.getElementById('count-control'),
    output: document.getElementById('count-value'),
    format: (value) => `${Math.round(Number(value))}`
  }
};

function getTheme() {
  return THEMES[activeTheme];
}

function updatePaletteButtonText() {
  if (!togglePaletteButton) {
    return;
  }

  togglePaletteButton.textContent = activeTheme === 'warm' ? 'Switch to cold palette' : 'Switch to warm palette';
}

function updateControlValueLabel(settingName) {
  const control = controls[settingName];
  if (!control || !control.output) {
    return;
  }

  control.output.textContent = control.format(settings[settingName]);
}

function getDrumColor(drumIndex) {
  return DRUM_COLORS[drumIndex % DRUM_COLORS.length];
}

function setupControls() {
  Object.entries(controls).forEach(([settingName, control]) => {
    if (!control.input) {
      return;
    }

    control.input.value = settings[settingName];
    updateControlValueLabel(settingName);

    control.input.addEventListener('input', (event) => {
      const parsedValue = Number(event.target.value);
      if (!Number.isFinite(parsedValue)) {
        return;
      }

      settings[settingName] = settingName === 'maxParticles'
        ? Math.min(MAX_PARTICLES_LIMIT, Math.round(parsedValue))
        : parsedValue;

      if (settingName === 'maxParticles' && particles.length > settings.maxParticles) {
        particles.splice(0, particles.length - settings.maxParticles);
      }

      updateControlValueLabel(settingName);
    });
  });
}

function applySettings(nextSettings) {
  Object.entries(controls).forEach(([settingName, control]) => {
    if (!Object.prototype.hasOwnProperty.call(nextSettings, settingName)) {
      return;
    }

    const rawValue = nextSettings[settingName];
    settings[settingName] = settingName === 'maxParticles'
      ? Math.min(MAX_PARTICLES_LIMIT, Math.round(rawValue))
      : rawValue;

    if (control.input) {
      control.input.value = settings[settingName];
    }

    updateControlValueLabel(settingName);
  });

  if (particles.length > settings.maxParticles) {
    particles.splice(0, particles.length - settings.maxParticles);
  }
}

function seedInitialParticles(centerX = width * 0.5, centerY = height * 0.5) {
  particles.length = 0;
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(centerX + random(-25, 25), centerY + random(-25, 25), 0.5));
  }
}

function resetToInitialState() {
  activeTheme = DEFAULT_THEME;
  document.body.dataset.theme = activeTheme;
  updatePaletteButtonText();

  mouse.x = width * 0.5;
  mouse.y = height * 0.5;
  mouse.px = mouse.x;
  mouse.py = mouse.y;

  applySettings(DEFAULT_SETTINGS);
  seedInitialParticles(mouse.x, mouse.y);
  
  // Clear drum sequencer
  Object.keys(drummachineState.sequence).forEach((drumIndex) => {
    drummachineState.sequence[drumIndex] = [];
  });
  drummachineState.visualSequence = [];
  drummachineState.currentDrum = 0;
  
  // Stop playback
  if (drummachineState.isPlaying) {
    Tone.Transport.stop();
    drummachineState.isPlaying = false;
    drummachineState.currentStep = 0;
    const toggleButton = document.getElementById('toggle-transport');
    if (toggleButton) {
      toggleButton.textContent = 'Start Playback';
    }
  }
}

function closeContextMenu() {
  if (!contextMenu) {
    return;
  }

  contextMenu.classList.remove('is-open');
  contextMenu.setAttribute('aria-hidden', 'true');
}

function openContextMenu(clientX, clientY) {
  if (!contextMenu) {
    return;
  }

  contextMenu.classList.add('is-open');
  contextMenu.setAttribute('aria-hidden', 'false');

  const margin = 8;
  const menuWidth = contextMenu.offsetWidth;
  const menuHeight = contextMenu.offsetHeight;
  const left = Math.min(clientX, window.innerWidth - menuWidth - margin);
  const top = Math.min(clientY, window.innerHeight - menuHeight - margin);

  contextMenu.style.left = `${Math.max(margin, left)}px`;
  contextMenu.style.top = `${Math.max(margin, top)}px`;
}

class Particle {
  constructor(x, y, speedBoost = 1) {
    this.x = x;
    this.y = y;

    const angle = random(TWO_PI);
    const speed = random(0.4, 2.2) * speedBoost;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;

    this.radius = random(2, 5);
    this.life = random(80, 180);
    this.maxLife = this.life;
    this.seed = random(1000);
    this.depth = random(0.25, 1); // used for color depth / ondulations
  }

  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const distance = max(1, sqrt(dx * dx + dy * dy));

    const tangentialStrength = settings.swirlStrength * this.depth;
    this.vx += (-dy / distance) * tangentialStrength;
    this.vy += (dx / distance) * tangentialStrength;

    const pullStrength = constrain(
      map(distance, 0, 220, settings.pullStrengthNear, 0.002),
      0.002,
      settings.pullStrengthNear
    );
    this.vx += (mouse.x - this.x) * pullStrength;
    this.vy += (mouse.y - this.y) * pullStrength;

    this.vx *= settings.damping;
    this.vy *= settings.damping;

    const t = frameCount * 0.025 + this.seed;
    this.x += this.vx + sin(t) * settings.wobble;
    this.y += this.vy + cos(t * 0.85) * settings.wobble;

    this.life -= 1;
  }

  draw() {
    const lifeRatio = this.life / this.maxLife;
    const d = dist(this.x, this.y, mouse.x, mouse.y);
    const theme = getTheme();

    const depthShift = map(
      sin(frameCount * 0.02 + this.seed),
      -1,
      1,
      theme.depthShiftRange[0],
      theme.depthShiftRange[1]
    );
    const nearFarShift = map(
      constrain(d, 0, 240),
      0,
      240,
      theme.nearFarShiftRange[0],
      theme.nearFarShiftRange[1]
    );

    const hue = theme.hueBase + depthShift + nearFarShift;
    const sat = map(this.depth, 0.25, 1, theme.satRange[0], theme.satRange[1]);
    const bri = map(this.depth, 0.25, 1, theme.briRange[0], theme.briRange[1]);
    const alpha = map(lifeRatio, 0, 1, 0, 70) * map(d, 0, 240, 1, 0.55);

    noStroke();
    fill(hue, sat, bri, alpha);
    circle(this.x, this.y, this.radius * settings.particleSize * (0.6 + lifeRatio));
  }

  isDead() {
    return this.life <= 0;
  }
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('pointer-events', 'none');

  noCursor();

  colorMode(HSB, 360, 100, 100, 100);
  mouse.x = width * 0.5;
  mouse.y = height * 0.5;
  mouse.px = mouse.x;
  mouse.py = mouse.y;

  document.body.dataset.theme = activeTheme;
  updatePaletteButtonText();
  setupControls();
  seedInitialParticles(mouse.x, mouse.y);
  
  // Initialize drum machine
  initDrumMachine();
}

function draw() {
  const dx = mouseX - mouse.px;
  const dy = mouseY - mouse.py;
  const speed = sqrt(dx * dx + dy * dy);

  mouse.x = isFinite(mouseX) ? mouseX : mouse.x;
  mouse.y = isFinite(mouseY) ? mouseY : mouse.y;

  background(...getTheme().bg);

  const spawnCount = constrain(
    floor(map(speed, 0, 55, 1, 7) * settings.spawnRate),
    1,
    10
  );
  for (let i = 0; i < spawnCount; i++) {
    if (particles.length >= settings.maxParticles) {
      particles.shift();
    }

    const spread = map(speed, 0, 55, 10, 28);
    const px = mouse.x + random(-spread, spread);
    const py = mouse.y + random(-spread, spread);
    const boost = map(speed, 0, 55, 0.8, 1.9);
    particles.push(new Particle(px, py, boost));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.update();
    particle.draw();

    if (particle.isDead()) {
      particles.splice(i, 1);
    }
  }

  mouse.px = mouse.x;
  mouse.py = mouse.y;
  
  // ==================== DRUM VISUALIZATION ====================
  
  // Draw grid lines
  push();
  stroke(255, 255, 255, 15);
  strokeWeight(1);
  const stepWidth = width / drummachineState.gridSteps;
  for (let i = 0; i <= drummachineState.gridSteps; i++) {
    const x = i * stepWidth;
    line(x, 0, x, height);
  }
  pop();
  
  // Draw current playback indicator
  if (drummachineState.isPlaying) {
    push();
    const playheadX = (drummachineState.currentStep + 0.5) * stepWidth;
    stroke(100, 100, 100, 60);
    strokeWeight(stepWidth * 0.8);
    line(playheadX, 0, playheadX, height);
    pop();
  }
  
  // Draw sequenced drum hits
  drummachineState.visualSequence.forEach(({ x, y, drumIndex, step }) => {
    push();
    const isActive = drummachineState.isPlaying && drummachineState.currentStep === step;

    const [h, s, b] = getDrumColor(drumIndex);
    const alpha = isActive ? 90 : 50;
    const size = isActive ? 40 : 28;
    
    fill(h, s, b, alpha);
    noStroke();
    circle(x, y, size);
    
    // Draw drum name on active steps
    if (isActive) {
      fill(h, s, b, 100);
      textAlign(CENTER, CENTER);
      textSize(12);
      text(DRUM_NAMES[drumIndex], x, y - 30);
    }
    pop();
  });
  
  // Display current drum selection in top-left corner
  push();
  const [textH, textS, textB] = getDrumColor(drummachineState.currentDrum);
  fill(textH, textS, textB, 90);
  textAlign(LEFT, TOP);
  textSize(16);
  text(DRUM_NAMES[drummachineState.currentDrum], 20, 20);
  pop();

  // Custom cursor tinted to current instrument
  push();
  const [cursorH, cursorS, cursorB] = getDrumColor(drummachineState.currentDrum);
  noStroke();
  fill(cursorH, cursorS, cursorB, 85);
  circle(mouse.x, mouse.y, 16);
  stroke(cursorH, cursorS, cursorB, 95);
  noFill();
  circle(mouse.x, mouse.y, 26);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  closeContextMenu();
}

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  openContextMenu(event.clientX, event.clientY);
});

window.addEventListener('click', (event) => {
  const contextMenu = document.getElementById('context-menu');
  if (!contextMenu) {
    return;
  }

  if (!contextMenu.classList.contains('is-open')) {
    // Allow left-click drum sequencing when menu is closed
    if (event.button === 0) {
      handleLeftClick(event);
    }
    return;
  }

  if (!contextMenu.contains(event.target)) {
    closeContextMenu();
  }
});

function shouldIgnoreSpaceToggle(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'button', 'select', 'option'].includes(tagName);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeContextMenu();
    return;
  }

  const isSpace = event.code === 'Space' || event.key === ' ';
  if (isSpace && !shouldIgnoreSpaceToggle(event.target)) {
    event.preventDefault();
    togglePlayback();
  }
});

if (togglePaletteButton) {
  togglePaletteButton.addEventListener('click', () => {
    activeTheme = activeTheme === 'warm' ? 'cold' : 'warm';
    document.body.dataset.theme = activeTheme;
    updatePaletteButtonText();
  });
}

if (presetCalmButton) {
  presetCalmButton.addEventListener('click', () => {
    applySettings(PRESETS.calm);
  });
}

if (presetBalancedButton) {
  presetBalancedButton.addEventListener('click', () => {
    applySettings(PRESETS.balanced);
  });
}

if (presetEnergeticButton) {
  presetEnergeticButton.addEventListener('click', () => {
    applySettings(PRESETS.energetic);
  });
}

if (resetAllButton) {
  resetAllButton.addEventListener('click', () => {
    resetToInitialState();
  });
}

// ==================== DRUM MACHINE INITIALIZATION ====================

function initDrumMachine() {
  // Initialize sequence storage
  for (let i = 0; i < DRUM_NAMES.length; i++) {
    drummachineState.sequence[i] = [];
  }

  console.log('✓ Initializing synthetic drums (no download required)...');
  
  // Create synthetic drum sounds using Tone.js synthesis
  // 0: Kick - deep bass drum
  drummachineState.synths[0] = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
  }).toDestination();
  
  // 1: Snare - crispy snare with noise
  drummachineState.synths[1] = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
  }).toDestination();
  
  // 2: Hi-Hat Closed - short metallic sound
  drummachineState.synths[2] = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();
  drummachineState.synths[2].volume.value = -15;
  
  // 3: Hi-Hat Open - longer metallic sound
  drummachineState.synths[3] = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();
  drummachineState.synths[3].volume.value = -12;
  
  // 4: Tom High - high pitched drum
  drummachineState.synths[4] = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.8 }
  }).toDestination();
  
  // 5: Tom Mid - mid pitched drum
  drummachineState.synths[5] = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 8,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 1.0 }
  }).toDestination();
  
  // 6: Tom Low - low pitched drum
  drummachineState.synths[6] = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.2 }
  }).toDestination();
  
  // 7: Crash - long metallic crash
  drummachineState.synths[7] = new Tone.MetalSynth({
    frequency: 150,
    envelope: { attack: 0.001, decay: 1.4, release: 3 },
    harmonicity: 12,
    modulationIndex: 40,
    resonance: 3000,
    octaves: 2
  }).toDestination();
  drummachineState.synths[7].volume.value = -18;
  
  // 8: Ride - bell-like cymbal
  drummachineState.synths[8] = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 0.6, release: 0.4 },
    harmonicity: 3.5,
    modulationIndex: 30,
    resonance: 5000,
    octaves: 1.2
  }).toDestination();
  drummachineState.synths[8].volume.value = -10;

  // Setup Tone.js transport with 120 BPM
  Tone.Transport.bpm.value = drummachineState.bpm;

  // Create looping sequencer callback
  drummachineState.sequenceLoop = new Tone.Sequence((time, step) => {
    drummachineState.currentStep = step;
    
    // Check all drum tracks for triggers at this step
    Object.keys(drummachineState.sequence).forEach((drumIndex) => {
      if (drummachineState.sequence[drumIndex].includes(step)) {
        const synth = drummachineState.synths[drumIndex];
        if (synth) {
          // Trigger synthetic drums with appropriate notes
          if (drumIndex == 0) synth.triggerAttackRelease('C1', '8n', time); // Kick
          else if (drumIndex == 1) synth.triggerAttackRelease('8n', time); // Snare (NoiseSynth)
          else if (drumIndex == 4) synth.triggerAttackRelease('G3', '8n', time); // Tom High
          else if (drumIndex == 5) synth.triggerAttackRelease('D3', '8n', time); // Tom Mid
          else if (drumIndex == 6) synth.triggerAttackRelease('A2', '8n', time); // Tom Low
          else synth.triggerAttackRelease('16n', time); // Metallic sounds (hi-hats, crash, ride)
        }
      }
    });
  }, [...Array(drummachineState.gridSteps).keys()], "16n");

  drummachineState.sequenceLoop.loop = true;
  drummachineState.sequenceLoop.start(0);

  console.log('✓ Synthetic drum machine ready!');
  updateDrumMachineUI();
}

function updateLoadingStatus() {
  const toggleButton = document.getElementById('toggle-transport');
  if (toggleButton) {
    // Synthetic drums are always ready
    toggleButton.disabled = false;
    toggleButton.style.opacity = '1';
  }
}

async function togglePlayback() {
  if (!drummachineState.samplesLoaded) {
    alert('Drum samples are still loading. Please wait...');
    return;
  }

  const toggleTransportButton = document.getElementById('toggle-transport');

  if (!drummachineState.isPlaying) {
    await Tone.start();
    Tone.Transport.start();
    drummachineState.isPlaying = true;
    if (toggleTransportButton) {
      toggleTransportButton.textContent = 'Stop Playback';
    }
    console.log('Playback started');
  } else {
    Tone.Transport.stop();
    drummachineState.isPlaying = false;
    drummachineState.currentStep = 0;
    if (toggleTransportButton) {
      toggleTransportButton.textContent = 'Start Playback';
    }
    console.log('Playback stopped');
  }
}

function updateDrumMachineUI() {
  const bpmControl = document.getElementById('bpm-control');
  const bpmValue = document.getElementById('bpm-value');
  const gridControl = document.getElementById('grid-control');
  const gridValue = document.getElementById('grid-value');
  const toggleTransportButton = document.getElementById('toggle-transport');
  const clearButton = document.getElementById('clear-sequence');

  if (bpmControl && bpmValue) {
    bpmControl.value = drummachineState.bpm;
    bpmValue.textContent = String(drummachineState.bpm);
    
    bpmControl.addEventListener('input', (e) => {
      drummachineState.bpm = Number(e.target.value);
      Tone.Transport.bpm.value = drummachineState.bpm;
      bpmValue.textContent = String(drummachineState.bpm);
    });
  }

  if (gridControl && gridValue) {
    gridControl.value = String(drummachineState.gridSteps);
    gridValue.textContent = String(drummachineState.gridSteps);
    
    gridControl.addEventListener('input', (e) => {
      const newSteps = Number(e.target.value);
      drummachineState.gridSteps = newSteps;
      gridValue.textContent = String(newSteps);
      
      // Clear out-of-range steps
      Object.keys(drummachineState.sequence).forEach((drumIndex) => {
        drummachineState.sequence[drumIndex] = drummachineState.sequence[drumIndex].filter(s => s < newSteps);
      });
      
      // Rebuild visual sequence
      drummachineState.visualSequence = drummachineState.visualSequence.filter(v => v.step < newSteps);
      
      // Rebuild the sequence loop with new grid size
      if (drummachineState.sequenceLoop) {
        drummachineState.sequenceLoop.clear();
        drummachineState.sequenceLoop.events = [...Array(newSteps).keys()];
      }
    });
  }

  if (toggleTransportButton) {
    toggleTransportButton.addEventListener('click', () => {
      togglePlayback();
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      Object.keys(drummachineState.sequence).forEach((drumIndex) => {
        drummachineState.sequence[drumIndex] = [];
      });
      drummachineState.visualSequence = [];
    });
  }
  
  // Set initial loading state
  updateLoadingStatus();
}

// ==================== MOUSE/WHEEL INPUT FOR DRUMS ====================

function handleMouseWheel(event) {
  event.preventDefault();
  
  if (event.deltaY < 0) {
    // Scroll up
    drummachineState.currentDrum = (drummachineState.currentDrum + 1) % DRUM_NAMES.length;
  } else {
    // Scroll down
    drummachineState.currentDrum = (drummachineState.currentDrum - 1 + DRUM_NAMES.length) % DRUM_NAMES.length;
  }
  
  console.log(`Selected drum: ${DRUM_NAMES[drummachineState.currentDrum]}`);
}

function handleLeftClick(event) {
  // Ignore clicks on context menu
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu && contextMenu.classList.contains('is-open')) {
    return;
  }

  const clickX = event.clientX;
  const clickY = event.clientY;
  
  // Map click position to a step (grid subdivision)
  const stepWidth = width / drummachineState.gridSteps;
  const stepIndex = Math.floor(clickX / stepWidth);
  
  if (stepIndex >= 0 && stepIndex < drummachineState.gridSteps) {
    const drumIndex = drummachineState.currentDrum;
    const sequence = drummachineState.sequence[drumIndex];
    
    if (sequence.includes(stepIndex)) {
      // Remove step
      drummachineState.sequence[drumIndex] = sequence.filter(s => s !== stepIndex);
      drummachineState.visualSequence = drummachineState.visualSequence.filter(
        v => !(v.drumIndex === drumIndex && v.step === stepIndex)
      );
    } else {
      // Add step
      drummachineState.sequence[drumIndex].push(stepIndex);
      drummachineState.visualSequence.push({
        x: clickX,
        y: clickY,
        drumIndex: drumIndex,
        step: stepIndex
      });
    }
    
    console.log(`Toggled ${DRUM_NAMES[drumIndex]} at step ${stepIndex}`);
  }
}

window.addEventListener('wheel', handleMouseWheel, { passive: false });
