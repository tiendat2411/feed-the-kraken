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

def main():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\ee889917-0fa7-4ddf-b436-406bd887f6ae"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")
    os.makedirs(sprites_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)

    # 1. Flintlock Pistol
    pistol_files = glob.glob(os.path.join(brain_dir, "flintlock_pistol_raw_*.jpg"))
    if pistol_files:
        latest = max(pistol_files, key=os.path.getctime)
        print(f"Processing Pistol: {latest}")
        img = Image.open(latest)
        clean = flood_fill_outer_white(img, threshold=230, feather_radius=1)
        out_path = os.path.join(sprites_dir, "icon_flintlock_pistol.png")
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

    # 2. Dossier Parchment Plate
    plate_files = glob.glob(os.path.join(brain_dir, "dossier_parchment_plate_raw_*.jpg"))
    if plate_files:
        latest = max(plate_files, key=os.path.getctime)
        print(f"Processing Dossier Plate: {latest}")
        img = Image.open(latest)
        clean = flood_fill_outer_white(img, threshold=230, feather_radius=1)
        out_path = os.path.join(frames_dir, "dossier_parchment_plate.png")
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

    # 3. Faction Wax Seals
    seals_files = glob.glob(os.path.join(brain_dir, "faction_wax_seals_raw_*.jpg"))
    if seals_files:
        latest = max(seals_files, key=os.path.getctime)
        print(f"Processing Seals: {latest}")
        img = Image.open(latest)
        w, h = img.size
        # Slicing into 3 columns
        col_w = w // 3
        seals = [
            ("seal_sailor_admiralty.png", (0, 0, col_w, h)),
            ("seal_pirate_mutineer.png", (col_w, 0, col_w * 2, h)),
            ("seal_cult_eldritch.png", (col_w * 2, 0, w, h)),
        ]
        for name, crop_box in seals:
            sub = img.crop(crop_box)
            clean = flood_fill_outer_white(sub, threshold=230, feather_radius=1)
            out_path = os.path.join(sprites_dir, name)
            clean.save(out_path, "PNG")
            print(f" -> Saved {out_path} ({clean.size})")

if __name__ == "__main__":
    main()
