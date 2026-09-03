import os
import glob
from collections import deque
from PIL import Image, ImageFilter

def flood_fill_outer_white(img, threshold=235, feather_radius=1):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    visited = set()
    queue = deque()

    def is_outer_white(x, y):
        r, g, b, _ = pixels[x, y]
        return r > threshold and g > threshold and b > threshold

    for x in range(width):
        if is_outer_white(x, 0) and (x, 0) not in visited:
            visited.add((x, 0))
            queue.append((x, 0))
        if is_outer_white(x, height - 1) and (x, height - 1) not in visited:
            visited.add((x, height - 1))
            queue.append((x, height - 1))

    for y in range(height):
        if is_outer_white(0, y) and (0, y) not in visited:
            visited.add((0, y))
            queue.append((0, y))
        if is_outer_white(width - 1, y) and (width - 1, y) not in visited:
            visited.add((width - 1, y))
            queue.append((width - 1, y))

    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in neighbors:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited and is_outer_white(nx, ny):
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    mask = Image.new("L", (width, height), 255)
    mask_pixels = mask.load()
    for x, y in visited:
        mask_pixels[x, y] = 0

    if feather_radius > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    img.putalpha(mask)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_titles():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\ee889917-0fa7-4ddf-b436-406bd887f6ae"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")

    title_files = glob.glob(os.path.join(brain_dir, "role_titles_engraved_raw_*.jpg"))
    if not title_files:
        print("No title files found!")
        return
    latest = max(title_files, key=os.path.getctime)
    print(f"Processing Titles from: {latest}")
    img = Image.open(latest).convert("RGB")
    w, h = img.size

    # Analyze vertical projection to find 4 bands
    pixels = img.load()
    row_density = []
    for y in range(h):
        dark_count = 0
        for x in range(w):
            r, g, b = pixels[x, y]
            if r < 235 or g < 235 or b < 235:
                dark_count += 1
        row_density.append(dark_count)

    in_band = False
    bands = []
    start_y = 0
    for y, count in enumerate(row_density):
        if not in_band and count > 30:
            in_band = True
            start_y = max(0, y - 4)
        elif in_band and count <= 30:
            in_band = False
            end_y = min(h, y + 4)
            if end_y - start_y > 40:
                bands.append((start_y, end_y))
    if in_band:
        bands.append((start_y, h))

    print(f"Detected {len(bands)} title bands: {bands}")
    names = [
        "title_role_sailor.png",
        "title_role_pirate.png",
        "title_role_cult_leader.png",
        "title_role_cultist.png",
    ]

    for i, (sy, ey) in enumerate(bands[:4]):
        sub = img.crop((0, sy, w, ey))
        clean = flood_fill_outer_white(sub, threshold=235, feather_radius=1)
        out_path = os.path.join(sprites_dir, names[i])
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

def process_emblems():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\ee889917-0fa7-4ddf-b436-406bd887f6ae"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")

    emblem_files = glob.glob(os.path.join(brain_dir, "faction_emblems_opaque_raw_*.jpg"))
    if not emblem_files:
        print("No emblem files found!")
        return
    latest = max(emblem_files, key=os.path.getctime)
    print(f"Processing Emblems from: {latest}")
    img = Image.open(latest).convert("RGB")
    w, h = img.size
    half_w, half_h = w // 2, h // 2

    # In each quadrant, text label is at the very top (roughly 17-18% of quadrant)
    label_offset_top = int(half_h * 0.18)
    label_offset_bot = int(half_h * 0.16)

    quadrants = [
        ("emblem_pirate.png", (0, label_offset_top, half_w, half_h)),
        ("emblem_sailor.png", (half_w, label_offset_top, w, half_h)),
        ("emblem_cult_leader.png", (0, half_h + label_offset_bot, half_w, h)),
        ("emblem_cultist.png", (half_w, half_h + label_offset_bot, w, h)),
    ]

    for name, crop_box in quadrants:
        quad = img.crop(crop_box)
        clean = flood_fill_outer_white(quad, threshold=230, feather_radius=1)
        out_path = os.path.join(sprites_dir, name)
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

if __name__ == "__main__":
    process_titles()
    process_emblems()
