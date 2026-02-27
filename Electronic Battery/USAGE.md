# Quick Start Guide

## Opening the Application

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, or Safari)
2. The particle animation will start automatically
3. Move your mouse to see the water-like particle effects

## Using the Drum Machine

### Adding Drum Beats

1. **Select a drum sound**: Scroll your mouse wheel up/down to cycle through 9 drum types
   - The selected drum is shown in the top-left corner
   - Available drums: Kick, Snare, Hi-Hat (2 types), Toms (3 types), Crash, Ride

2. **Add/remove steps**: Left-click anywhere on the canvas to toggle a drum hit at that position
   - The horizontal position determines when the drum plays (left = early, right = late)
   - Click on an existing drum marker to remove it
   - Each colored circle represents one drum hit

3. **Start playback**: Right-click to open the menu, then click "Start Playback"
   - The drum loop will play continuously at 120 BPM
   - A moving vertical bar shows the current playback position
   - Active drum hits light up when they play

### Adjusting Settings

Right-click anywhere to open the settings menu:

**Drum Controls:**
- **BPM**: Speed of playback (60-180 beats per minute)
- **Grid Steps**: Number of time divisions (8-32 steps)
- **Clear All Steps**: Remove all programmed drum hits
- **Start/Stop Playback**: Control the audio engine

**Particle Controls:**
- Adjust swirl, pull, damping, wobble, spawn rate, size, and count
- Switch between warm (orange/red) and cold (blue/cyan) color palettes
- Use presets (Calm/Balanced/Energetic) for quick particle behavior changes

### Tips

- **Create beats**: Try clicking drums on beats 1, 5, 9, 13 for a basic 4/4 pattern
- **Layer sounds**: Each drum type can have its own pattern - build complex rhythms
- **Mouse wheel**: Keep scrolling to cycle through all 9 drum sounds
- **Visual feedback**: Each drum type has its own color for easy identification
- **Performance**: The app handles hundreds of particles + audio playback smoothly

## Keyboard Shortcuts

- **Right-click**: Open settings menu
- **Left-click**: Add/remove drum steps (when menu is closed)
- **Mouse wheel**: Select different drums
- **Escape**: Close settings menu

## Troubleshooting

**No sound?**
- Click "Start Playback" in the menu - browsers require user interaction to enable audio
- Check your system volume
- Make sure you've added some drum steps by left-clicking

**Lag or slow performance?**
- Reduce particle count in the settings menu
- Close other browser tabs
- Try a lower BPM setting

**Can't add drums?**
- Make sure the context menu isn't open (right-click menu)
- Click outside the menu first to close it
- Check that you've selected a drum with the mouse wheel

## Credits

Drum sounds generated using:
- **Tone.js** - Web Audio synthesis framework (MIT licensed)
- **MembraneSynth, NoiseSynth, MetalSynth** - Real-time drum synthesis
- All sounds created dynamically - no external samples required!

Particle engine and sequencer by: GitHub Copilot + User collaboration
