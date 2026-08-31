import os
from PIL import Image, ImageDraw, ImageOps, ImageFilter
from collections import deque

def remove_outer_white_tracked(img, threshold=235):
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
    return img, bbox

def process_perfect_gems_and_plate():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")

    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)

    # 1. Precise crop of crew plate
    crew_crop = p_img.crop((0, 275, p_img.width, 485))

    # Known Gem centroid in crew_crop: (1261.0, 111.0), radius = 37.0
    gem_raw_cx = 1261.0
    gem_raw_cy = 111.0
    gem_radius = 36.5

    # ── 2. Extract Perfect Emerald Gem ──
    gw = int(gem_radius * 2)
    gh = int(gem_radius * 2)
    gem_box = (
        int(gem_raw_cx - gem_radius),
        int(gem_raw_cy - gem_radius),
        int(gem_raw_cx + gem_radius),
        int(gem_raw_cy + gem_radius)
    )
    raw_gem_crop = crew_crop.crop(gem_box).convert("RGBA")

    # Circular mask with smooth anti-aliased edge
    mask = Image.new("L", (raw_gem_crop.width, raw_gem_crop.height), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((1, 1, raw_gem_crop.width - 2, raw_gem_crop.height - 2), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))

    emerald_gem = raw_gem_crop.copy()
    emerald_gem.putalpha(mask)
    emerald_path = os.path.join(sprites_dir, "gem_emerald_online.png")
    emerald_gem.save(emerald_path, "PNG")
    print(f"Perfect Emerald Gem saved: {emerald_gem.size}")

    # ── 3. Create Perfect Ruby Gem ──
    em_gray = ImageOps.grayscale(emerald_gem)
    ruby_rgb = ImageOps.colorize(em_gray, black="#1A0204", white="#FFB5B5", mid="#D2143A").convert("RGBA")
    ruby_gem = Image.merge("RGBA", (*ruby_rgb.split()[:3], emerald_gem.split()[3]))
    ruby_path = os.path.join(sprites_dir, "gem_ruby_offline.png")
    ruby_gem.save(ruby_path, "PNG")
    print(f"Perfect Ruby Gem saved: {ruby_gem.size}")

    # ── 4. Remove outer background & punch holes in crew plate ──
    cleaned_img, bbox = remove_outer_white_tracked(crew_crop, threshold=238)
    cropped_clean = cleaned_img.crop(bbox)
    cw, ch = cropped_clean.size

    # Calculate punched hole positions in cropped_clean:
    # Left porthole:
    left_hole_cx = 100.0 - bbox[0]
    left_hole_cy = 111.0 - bbox[1]
    left_hole_radius = 63.0

    # Right gem hole:
    right_hole_cx = gem_raw_cx - bbox[0]
    right_hole_cy = gem_raw_cy - bbox[1]
    right_hole_radius = gem_radius

    cp_pixels = cropped_clean.load()

    for x in range(cw):
        for y in range(ch):
            # Punch left porthole hole
            if x < cw * 0.3:
                dist_left = ((x - left_hole_cx)**2 + (y - left_hole_cy)**2)**0.5
                if dist_left < left_hole_radius:
                    cp_pixels[x, y] = (0, 0, 0, 0)
                elif dist_left < left_hole_radius + 2:
                    fade = (dist_left - left_hole_radius) / 2.0
                    r, g, b, a = cp_pixels[x, y]
                    cp_pixels[x, y] = (r, g, b, int(a * fade))

            # Punch right gem hole
            if x > cw * 0.7:
                dist_right = ((x - right_hole_cx)**2 + (y - right_hole_cy)**2)**0.5
                if dist_right < right_hole_radius:
                    cp_pixels[x, y] = (0, 0, 0, 0)
                elif dist_right < right_hole_radius + 2:
                    fade = (dist_right - right_hole_radius) / 2.0
                    r, g, b, a = cp_pixels[x, y]
                    cp_pixels[x, y] = (r, g, b, int(a * fade))

    plate_path = os.path.join(frames_dir, "crew_plate_wood.png")
    cropped_clean.save(plate_path, "PNG")
    print(f"Flawless Punched Crew Plate saved: {plate_path} ({cropped_clean.size})")

if __name__ == "__main__":
    process_perfect_gems_and_plate()
