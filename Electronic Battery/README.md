# Water Cursor Particles + Drum Machine

An interactive single-page web experience combining a fluid particle simulation with a real-time drum sequencer.

The page includes:
- A particle-based fluid-like motion around the cursor
- Soft color transitions to suggest depth and ondulations
- A configurable particle cap up to 240 (default 120) for performance control
- A custom right-click context menu to switch between warm and cold palettes
- Live simulation controls to tune particle behavior in real time
- One-click behavior presets (Calm, Balanced, Energetic)
- A full reset action to return to the initial state
- **NEW: Interactive drum machine with 9 synthesized drum sounds**
- **NEW: Visual step sequencer with 120 BPM precision playback**
- **NEW: Mouse wheel drum selection and left-click step programming**
- **NEW: No downloads required - all sounds generated in real-time!**

## Demo Behavior

### Particle Animation
- Move the mouse to generate and steer particles.
- Particles swirl and drift around the cursor with a damped, organic movement.
- Color tones vary smoothly over time and by distance from the cursor.

### Drum Machine
- **Left-click** anywhere on the canvas to add/remove drum steps at that grid position.
- Use the **mouse wheel** to cycle through 9 drum sounds:
  1. Kick Drum (Bass Drum): Deep, thumping low-frequency "boom"
  2. Snare Drum: Sharp, cracking "pop" or "crack"
  3. Hi-Hat (Closed): Crisp, short, metallic "chick" or "tsst"
  4. Hi-Hat (Open): Sustained metallic "tss" sound
  5. High Tom (Rack Tom 1): Resonant, tonal percussion with higher pitch
  6. Mid Tom (Rack Tom 2): Resonant, tonal percussion with medium pitch
  7. Floor Tom: Booming, deep, long-sustaining resonance
  8. Crash Cymbal: Explosive, loud, washing metallic crash
  9. Ride Cymbal: Clean, sustained, shimmering metallic "ping" or "ding"
- Sequenced drum hits are visualized as colored circles on the canvas.
- Active steps light up during playback.
- A vertical playhead bar moves across the grid showing the current beat.

### Controls
- **Right-click** anywhere to open the contextual menu.
- Toggle palette, adjust simulation parameters, and control the drum machine.
- Use **Start/Stop Playback** to control the drum loop.
- Adjust **BPM** (60-180) to change playback speed.
- Change **Grid Steps** (8-32) to set sequencer resolution.
- **Clear All Steps** button removes all programmed drum hits.

## Technical Stack

- HTML5 for page structure
- CSS3 for layout, themes, menu styling, and glow typography
- JavaScript for simulation and interaction logic
- p5.js (CDN) for rendering loop and drawing primitives
- **Tone.js (CDN) for precise audio scheduling and synthesis**
- **Web Audio API for real-time drum sound generation**

## Architecture

### Files

- index.html: Canvas page structure, custom context menu markup, and drum machine UI
- styles.css: Full-screen layout, warm/cold theme variables, menu visuals, form controls, glow effects
- script.js: Particle simulation, drum sequencer, audio playback, render loop, input handling, palette switching, and runtime settings binding

### Main Runtime Objects

- **Particle class**
  - Stores position, velocity, radius, life, depth factor, and random seed
  - Implements update and draw methods
- **particles array**
  - Active particle pool, capped by runtime settings (default 120, maximum 240)
- **mouse state**
  - Current and previous cursor positions used to estimate movement speed
- **THEMES configuration**
  - Warm/cold parameters for background and particle color model
- **settings object**
  - Runtime-adjustable simulation parameters controlled by menu sliders
- **controls mapping**
  - Binding between each menu range input, output label, and simulation setting
- **PRESETS configuration**
  - Named bundles for Calm, Balanced, and Energetic behavior profiles
- **drummachineState object**
  - Contains:
    - currentDrum: Selected drum index (0-8)
    - gridSteps: Sequencer resolution (8-32 steps)
    - bpm: Beats per minute (60-180)
    - sequence: Object mapping drum indices to arrays of active step numbers
    - synths: Tone.js synthesizers for each drum sound (MembraneSynth, NoiseSynth, MetalSynth)
    - isPlaying: Transport playback state
    - currentStep: Current playback position (0-gridSteps)
    - visualSequence: Array of visual step markers {x, y, drumIndex, step}
- **Tone.Transport**
  - Precise audio scheduling engine running at configured BPM
  - Loops through grid steps and triggers synthesized drums
- **Tone.Sequence**
  - Callback-based sequencer that checks all drum tracks for triggers at each step

## Context Menu Controls

The right-click menu now includes:

### Drum Machine Section
- **Start/Stop Playback**
  - Toggles Tone.js Transport to play/stop the drum loop
  - Automatically initializes Web Audio Context on first play

- **Clear All Steps**
  - Removes all programmed drum hits from the sequencer

- **BPM (Beats Per Minute)**
  - Range: 60-180 BPM
  - Default: 120 BPM
  - Controls playback speed (120 BPM = 120 beats per second as requested)

- **Grid Steps**
  - Range: 8-32 steps  
  - Default: 16 steps
  - Sets sequencer resolution (16 = one bar of 16th notes at 4/4 time)

### Particle Settings Section
- Swirl strength
  - Controls tangential rotational force around the cursor
  - Higher values increase circular/eddy motion

- Pull strength
  - Controls near-distance attraction force toward cursor
  - Higher values keep particles tighter around the pointer

- Damping
  - Controls velocity decay each frame
  - Lower values produce heavier drag; higher values preserve momentum

- Wobble
  - Controls sinusoidal micro-oscillation amplitude
  - Higher values increase ripple-like flutter

- Spawn rate
  - Multiplies speed-based particle emission rate
  - Higher values increase trail density and activity

- Particle size
  - Scales rendered particle radius
  - Higher values increase visual blob size

- Particle count
  - Sets active particle pool size at runtime
  - Clamped to 240 maximum (120 by default)

## Drum Sequencer Algorithm

The drum sequencer is built on Tone.js Transport for sample-accurate timing and uses a visual grid overlay:

### 1) Audio Engine Setup

On page load:
- 9 drum sounds are synthesized using Tone.js (kick, snare, hi-hats, toms, crash, ride).
- Each drum uses specialized synthesizers:
  - **Kick/Toms**: MembraneSynth for realistic drum membrane resonance
  - **Snare**: NoiseSynth for crispy white noise attack
  - **Hi-Hats/Crash/Ride**: MetalSynth for metallic, inharmonic timbres
- All synths are connected to the master output.
- Tone.Transport is configured to run at 120 BPM (matching the "120 beats per second" requirement).
- A Tone.Sequence is created that loops through all grid steps (default 16).
- **No external files or network required** - sounds are generated in real-time!

### 2) Step Programming

User interaction:
- **Mouse wheel** cycles through the 9 available drum sounds. Current selection is displayed in the top-left corner.
- **Left-click** on the canvas adds or removes a step for the selected drum at that horizontal grid position.
- Click position is mapped to a step index: `stepIndex = floor(clickX / stepWidth)`.
- Each drum has an independent array of active step numbers stored in `drummachineState.sequence[drumIndex]`.
- Visual markers are stored with {x, y, drumIndex, step} for canvas rendering.

### 3) Playback Loop

During playback:
- Tone.Transport triggers the Sequence callback at every 16th note (subdivision "16n").
- The callback receives the current step index and checks all drum tracks for triggers.
- If a drum's sequence array includes the current step, that drum's Player fires at the precise scheduled time.
- The playback loop repeats indefinitely until stopped.

### 4) Visual Feedback

On every draw() call:
- Vertical grid lines are drawn to show step boundaries.
- A highlighted playhead bar moves across the grid to show the current beat.
- Sequenced drum hits are rendered as colored circles at their stored {x, y} positions.
- Active steps (currently playing) are drawn larger and brighter.
- Each drum type has a distinct color for easy identification.

### 5) Real-Time Control

Users can adjust:
- **BPM**: Changes Tone.Transport.bpm.value instantly, accelerating or slowing playback.
- **Grid Steps**: Resizes the sequencer grid and clears out-of-range steps.
- **Clear All**: Empties all sequence arrays and visual markers.

Why this works:
- Tone.js Transport provides rock-solid timing independent of JavaScript event loop jitter.
- The 16n subdivision gives precise 16th-note resolution at any BPM.
- Sample-based playback (Tone.Player) is CPU-efficient and supports realistic drum sounds.
- Visual state is separate from audio state, allowing flexible canvas rendering without affecting timing.

## Presets and Reset

The right-click menu includes one-click behavior profiles:

- Calm
  - Lower swirl, pull, wobble, and spawn rate for smoother motion
  - Reduced particle density for a lighter visual load

- Balanced
  - Returns behavior values to the default baseline profile

- Energetic
  - Higher swirl, pull, wobble, and spawn rate for more active flow
  - Increased particle density and size for a stronger effect

Reset option:
- "Reset to initial state" restores all runtime settings to defaults, sets warm palette, recenters the cursor state, reseeds the initial particle cloud, and clears the drum sequencer.
- Reset applies immediately and keeps the menu open so users can verify changes in place.

## Particle Algorithm

The algorithm is a lightweight particle simulation tuned to visually imitate water-like flow.

### 1) Spawn Phase

On each animation frame:
- Cursor speed is estimated from current and previous mouse coordinates.
- Spawn count is mapped from speed, then multiplied by configurable spawn rate.
- New particles are created near the cursor with random spread and initial direction.
- If the pool is full (configured count, max 240), the oldest particle is removed before adding a new one.

Why this works:
- Speed-scaled emission creates stronger trails when the cursor moves quickly.
- Fixed-size pool provides predictable CPU and memory usage.

### 2) Force Model (Per Particle)

Each particle receives combined motion influences:

- Tangential swirl force
  - A perpendicular force relative to cursor direction
  - Strength is controlled by the Swirl strength setting
  - Produces circular/eddy movement around the pointer

- Cursor attraction force
  - Pulls particles toward the cursor with strength based on distance
  - Near-force maximum is controlled by Pull strength
  - Closer particles are stabilized; distant particles are gently pulled inward

- Damping
  - Velocity is multiplied by a factor below 1 each frame
  - Factor is controlled by the Damping setting
  - Prevents unstable acceleration and keeps motion smooth

- Procedural wobble
  - Small sinusoidal offsets from frame count and per-particle random seed
  - Amplitude is controlled by Wobble
  - Adds natural-looking micro-oscillation, similar to surface ripples

### 3) Integration

After applying forces:
- Velocity is updated first
- Position is advanced using updated velocity and wobble terms
- Remaining life is decremented

This is an explicit Euler-style integration, sufficient for this visual effect and inexpensive to compute.

### 4) Color and Depth Illusion

Particle color is computed in HSB space using:
- Base hue from the active theme (warm or cold)
- Time-based depth shift from a sine wave
- Distance-based near/far shift from cursor distance
- Saturation and brightness ranges scaled by each particle depth factor

Opacity is blended from:
- Remaining life ratio
- Distance attenuation relative to cursor

Result:
- Smooth color drift and alpha fading that suggest depth and ondulating layers.
- Warm/cold palette changes are applied instantly through shared theme parameters.

### 5) Lifecycle and Culling

A particle is removed when life reaches zero.
Additionally, pool pressure culling removes the oldest entry when spawning above the cap.
If particle count is reduced from the menu or a preset is applied, excess oldest particles are culled immediately.

Combined effect:
- Stable visual density
- Bounded resource usage
- No unbounded growth over time

## Context Menu and Palette Toggle

Custom context menu behavior:
- Browser default right-click menu is prevented
- Menu opens at click coordinates and is clamped to viewport edges
- Menu stays open when using palette, preset, and reset actions
- Menu closes on outside click, Escape, or window resize

Palette switching:
- Toggles body data-theme between warm and cold
- CSS variables update page/menu styling
- JS theme parameters update particle background and HSB mapping
- Theme toggle applies live without closing the menu

Control binding:
- Range inputs are initialized from runtime settings at startup
- Input events update settings and live value labels in real time
- Algorithm immediately consumes updated settings on the next frame

Preset and reset actions:
- Preset buttons apply grouped parameter values in one action
- Reset button restores initial theme and simulation state
- Preset and reset actions apply immediately and keep the menu open

### UX Rationale

- Keeping the menu open during palette/preset/reset actions enables immediate visual comparison without reopening the menu.
- Users can iterate faster by trying multiple profiles in sequence while preserving spatial focus on the simulation area.
- The close-on-outside-click behavior still keeps interaction lightweight and predictable.

## Performance Notes

- Maximum particles: configurable up to 240 (default 120)
- O(N) per frame update and draw, where N <= configured particle cap
- No external state management or heavy physics engine
- Works efficiently on typical desktop browsers
- Drum sounds are synthesized in real-time with minimal CPU overhead
- Audio playback is handled by optimized Web Audio API via Tone.js
- Visual rendering is limited to active sequencer steps (typically < 100 markers)
- **No network dependencies** - works completely offline!

## Browser Compatibility

- Modern browsers with Web Audio API support (Chrome, Firefox, Edge, Safari)
- Requires ES6+ JavaScript features
- Audio context may require user interaction to start (handled by "Start Playback" button)

## Run Instructions

Open index.html in a modern browser.

Optional local server example:
- Python: python -m http.server
- Then browse to http://localhost:8000
