import os
import glob
from PIL import Image

artifacts_dir = r"C:\Users\Montykona\.gemini\antigravity\brain\b67e7335-d2ea-4224-a915-f539faefe46c"
assets_dir = r"d:\Users\Montykona\OneDrive\00-AI\02 - AI Code\HTML_Projects\Home_page\Snake.Realistic\assets"

mappings = {
    "bg_jungle_": "background.png",
    "snake_head_": "snake-head.png",
    "snake_body_": "snake-body-straight.png",
    "snake_corner_": "snake-body-corner.png",
    "snake_tail_": "snake-tail.png",
    "monkey_": "pill.png",
    "boulder_": "obstacle.png"
}

def remove_white_bg(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    threshold = 220
    for item in datas:
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    return img

for prefix, target in mappings.items():
    files = glob.glob(os.path.join(artifacts_dir, prefix + "*.png"))
    if not files:
        print(f"Skipping {prefix}, no files found.")
        continue
    latest_file = max(files, key=os.path.getmtime)
    print(f"Processing {latest_file} -> {target}")
    
    img = Image.open(latest_file)
    
    if target != "background.png":
        img = remove_white_bg(img)
        # Resize to square without cropping to maintain original proportions
        img = img.resize((200, 200), Image.Resampling.LANCZOS)
    else:
        img = img.resize((800, 520), Image.Resampling.LANCZOS)
        
    img.save(os.path.join(assets_dir, target))

print("Assets processed and copied successfully.")
