from PIL import Image, ImageDraw
import os

assets_dir = 'd:/Users/Montykona/OneDrive/00-AI/02 - AI Code/HTML_Projects/Home_page/Snake.Realistic/assets'
os.makedirs(assets_dir, exist_ok=True)

size = 200

def create_snake_segment(filename, segment_type):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)

    if segment_type == 'head':
        # Draw head facing right
        d.ellipse([20, 40, 180, 160], fill=(220, 30, 30)) # Red head
        d.ellipse([140, 60, 160, 80], fill=(255, 255, 0)) # Yellow eye
        d.ellipse([140, 120, 160, 140], fill=(255, 255, 0)) # Yellow eye
        d.ellipse([145, 65, 155, 75], fill=(0, 0, 0)) # pupil
        d.ellipse([145, 125, 155, 135], fill=(0, 0, 0)) # pupil
        # Black/Yellow bands
        d.rectangle([60, 40, 80, 160], fill=(0,0,0))
        d.rectangle([80, 40, 90, 160], fill=(255,255,0))
    elif segment_type == 'straight':
        # Horizontal straight body
        d.rectangle([0, 40, 200, 160], fill=(220, 30, 30))
        # Stripes
        for x in [30, 90, 150]:
            d.rectangle([x, 40, x+20, 160], fill=(0,0,0))
        for x in [50, 110, 170]:
            d.rectangle([x, 40, x+10, 160], fill=(255, 255, 0))
    elif segment_type == 'corner':
        # Curved top to right
        d.pieslice([40, -160, 360, 160], 90, 180, fill=(220, 30, 30))
        d.pieslice([160, -40, 240, 40], 90, 180, fill=(0, 0, 0, 0))
        d.pieslice([40, -160, 360, 160], 110, 125, fill=(0,0,0))
        d.pieslice([40, -160, 360, 160], 125, 135, fill=(255, 255, 0))
        d.pieslice([40, -160, 360, 160], 150, 165, fill=(0,0,0))
        d.pieslice([40, -160, 360, 160], 165, 175, fill=(255, 255, 0))
    elif segment_type == 'corner2':
        # Curved top to left
        d.pieslice([-160, -160, 160, 160], 0, 90, fill=(220, 30, 30))
        d.pieslice([-40, -40, 40, 40], 0, 90, fill=(0, 0, 0, 0))
        d.pieslice([-160, -160, 160, 160], 30, 45, fill=(0,0,0))
        d.pieslice([-160, -160, 160, 160], 45, 55, fill=(255, 255, 0))
        d.pieslice([-160, -160, 160, 160], 70, 85, fill=(0,0,0))
        d.pieslice([-160, -160, 160, 160], 85, 95, fill=(255, 255, 0))        
    elif segment_type == 'tail':
        # Tail facing left
        d.polygon([(200, 40), (200, 160), (20, 100)], fill=(220, 30, 30))
        d.polygon([(150, 50), (150, 150), (110, 130), (110, 70)], fill=(0,0,0))
        
    img.save(os.path.join(assets_dir, filename))

create_snake_segment('snake-head.png', 'head')
create_snake_segment('snake-body-straight.png', 'straight')
create_snake_segment('snake-body-corner.png', 'corner2')
create_snake_segment('snake-tail.png', 'tail')

# Create Monkey (pill)
img = Image.new('RGBA', (size, size), (0,0,0,0))
d = ImageDraw.Draw(img)
d.ellipse([50, 50, 150, 150], fill=(139,69,19)) # Brown head
d.ellipse([60, 80, 140, 140], fill=(205,133,63)) # Light face
d.ellipse([30, 70, 60, 100], fill=(139,69,19))   # Left ear
d.ellipse([140, 70, 170, 100], fill=(139,69,19)) # Right ear
d.ellipse([80, 90, 90, 100], fill=(0,0,0))       # Left eye
d.ellipse([110, 90, 120, 100], fill=(0,0,0))     # Right eye
img.save(os.path.join(assets_dir, 'pill.png'))

# Create Boulder (obstacle)
img = Image.new('RGBA', (size, size), (0,0,0,0))
d = ImageDraw.Draw(img)
d.ellipse([20, 20, 180, 180], fill=(128,128,128)) # Stone form
d.ellipse([40, 40, 160, 160], outline=(105,105,105), width=10)
d.rectangle([60, 30, 100, 50], fill=(34,139,34)) # Moss
d.rectangle([130, 80, 170, 120], fill=(34,139,34)) # Moss
img.save(os.path.join(assets_dir, 'obstacle.png'))

# Create bright background
img = Image.new('RGBA', (800, 520), (144, 238, 144))
d = ImageDraw.Draw(img)
for i in range(0, 800, 40):
    for j in range(0, 520, 40):
        if (i+j)//40 % 2 == 0:
            d.rectangle([i, j, i+40, j+40], fill=(152, 251, 152))
img.save(os.path.join(assets_dir, 'background.png'))

print('Generated images successfully.')
