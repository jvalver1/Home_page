# Photorealistic Asset Guide for Jungle Snake Game

## Image Generation Service Temporarily Unavailable

The AI image generation service is currently at capacity. Here are your options:

---

## Option 1: Use Free Stock Photo Resources

### Recommended Sources (All Free & High Quality)

**For Jungle Background:**

- **Unsplash**: Search "jungle floor texture" or "tropical leaves top view"
- **Pexels**: Search "rainforest canopy" or "green leaves pattern"
- **Pixabay**: Search "jungle texture" or "tropical foliage"

**For Snake Textures:**

- **Unsplash**: Search "green snake scales" or "tree python"
- **Pexels**: Search "snake skin texture" or "reptile scales"

**For Monkey:**

- **Unsplash**: Search "monkey face" or "capuchin monkey"
- **Pexels**: Search "cute monkey portrait"

**For Obstacles:**

- **Unsplash**: Search "tree bark texture" or "jungle stone"
- **Pexels**: Search "moss covered rock" or "tree trunk cross section"

### Image Specifications Needed:

1. **background.png** (1024x1024px)
   - Dense jungle foliage, top-down view
   - Tileable if possible
   - Rich green colors

2. **snake-head.png** (128x128px, transparent background)
   - Green snake head, top-down view
   - Clear eyes visible
   - Crop and resize to 128x128

3. **snake-body.png** (128x128px, transparent background)
   - Green snake scales texture
   - Should tile seamlessly

4. **monkey.png** (128x128px, transparent background)
   - Cute monkey face
   - Friendly appearance
   - Remove background using online tools like remove.bg

5. **tree.png** (128x128px, transparent background)
   - Tree trunk cross-section or bark texture
   - Include moss if possible

6. **stone.png** (128x128px, transparent background)
   - Gray stone with moss
   - Natural weathered appearance

---

## Option 2: Try Image Generation Later

I can retry generating the images later when the service has capacity. The code I'm implementing will work with either AI-generated or manually sourced images.

---

## Option 3: Use Placeholder Images First

I can create simple placeholder images using canvas drawing that you can replace later with photorealistic ones.

---

## Tools for Image Editing

If you download images that need editing:

- **Remove Background**: remove.bg (free online tool)
- **Resize Images**: photopea.com (free Photoshop alternative)
- **Make Tileable**: Use GIMP's "Make Seamless" filter

---

## Next Steps

1. Download images from stock photo sites (or wait for AI generation)
2. Edit to specifications (resize, remove backgrounds)
3. Save to `assets/` folder with exact names above
4. The code I'm implementing will automatically load and use them

**The game code is being updated now to support these images!**
