import os
from PIL import Image, ImageDraw, ImageOps, ImageFilter, ImageEnhance
from collections import deque

def remove_outer_white(img, threshold=235):
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False for _ in range(h)] for _ in range(w)]
    q = deque()

    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
        visited[x][0] = True
        visited[x][h - 1] = True

    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
        visited[0][y] = True
        visited[w - 1][y] = True

    bg_mask = [[False for _ in range(h)] for _ in range(w)]

    while q:
        cx, cy = q.popleft()
        r, g, b, a = pixels[cx, cy]
        if r > threshold and g > threshold and b > threshold:
            bg_mask[cx][cy] = True
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    for x in range(w):
        for y in range(h):
            if bg_mask[x][y]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and bg_mask[nx][ny]:
                        is_edge = True
                        break
                if is_edge:
                    r, g, b, a = pixels[x, y]
                    if r > threshold - 20 and g > threshold - 20 and b > threshold - 20:
                        avg = (r + g + b) / 3.0
                        alpha = int(max(0, (255 - avg) / (255 - threshold + 20)) * 255)
                        pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_gems_and_plate():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")
    os.makedirs(sprites_dir, exist_ok=True)

    # 1. Load raw plates image
    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)
    pw, ph = p_img.size

    # Crop crew plate cleanly (Y: 280 to 480)
    crew_crop = p_img.crop((0, 280, pw, 480))
    crew_clean = remove_outer_white(crew_crop, threshold=238)
    cw, ch = crew_clean.size

    # ── 2. Extract Emerald Gem (Standalone circular asset) ──
    # The right gem in crew_clean is located at:
    # Center X ~ cw - ch/2 + 25 (around X = cw - 52, Y = ch/2 = 98.5)
    gem_cx = cw - 52.0
    gem_cy = ch / 2.0
    gem_r = 38.0  # Outer radius of gem

    # Crop the gem region
    gem_box = (int(gem_cx - gem_r), int(gem_cy - gem_r), int(gem_cx + gem_r), int(gem_cy + gem_r))
    gem_crop = crew_clean.crop(gem_box)
    gw, gh = gem_crop.size

    # Create smooth circular mask for standalone gem
    gem_mask = Image.new("L", (gw, gh), 0)
    draw_g = ImageDraw.Draw(gem_mask)
    draw_g.ellipse((2, 2, gw - 2, gh - 2), fill=255)
    gem_mask = gem_mask.filter(ImageFilter.GaussianBlur(0.8))

    emerald_gem = gem_crop.copy()
    emerald_gem.putalpha(gem_mask)
    emerald_gem.save(os.path.join(sprites_dir, "gem_emerald_online.png"), "PNG")
    print(f"Saved Emerald Gem: {emerald_gem.size}")

    # ── 3. Create Ruby Gem by hue-shifting the Emerald Gem ──
    # Convert RGB channels to ruby red
    em_r, em_g, em_b, em_a = emerald_gem.split()
    gray_gem = ImageOps.grayscale(emerald_gem)
    ruby_colored = ImageOps.colorize(gray_gem, black="#1A0204", white="#FFA0A0", mid="#C41E3A").convert("RGBA")
    ruby_gem = Image.merge("RGBA", (*ruby_colored.split()[:3], em_a))
    ruby_gem.save(os.path.join(sprites_dir, "gem_ruby_offline.png"), "PNG")
    print(f"Saved Ruby Gem: {ruby_gem.size}")

    # ── 4. Punch both holes on crew_plate_wood.png (Left porthole & Right jewel socket) ──
    cp_pixels = crew_clean.load()

    # Left Porthole Hole
    hole_cx = ch / 2.0 + 8
    hole_cy = ch / 2.0
    hole_radius = ch * 0.32

    for x in range(int(ch + 20)):
        for y in range(ch):
            dist = ((x - hole_cx)**2 + (y - hole_cy)**2)**0.5
            if dist < hole_radius:
                cp_pixels[x, y] = (0, 0, 0, 0)

    # Right Jewel Socket Hole (Punch out inner gem area)
    right_hole_cx = gem_cx
    right_hole_cy = gem_cy
    right_hole_radius = 29.0  # Inner radius of the silver socket

    for x in range(int(cw - 100), cw):
        for y in range(ch):
            dist = ((x - right_hole_cx)**2 + (y - right_hole_cy)**2)**0.5
            if dist < right_hole_radius:
                cp_pixels[x, y] = (0, 0, 0, 0)
            elif dist < right_hole_radius + 2:
                fade = (dist - right_hole_radius) / 2.0
                r, g, b, a = cp_pixels[x, y]
                cp_pixels[x, y] = (r, g, b, int(a * fade))

    crew_out = os.path.join(frames_dir, "crew_plate_wood.png")
    crew_clean.save(crew_out, "PNG")
    print(f"Saved Punched Crew Plate: {crew_out} ({crew_clean.size})")

if __name__ == "__main__":
    process_gems_and_plate()
