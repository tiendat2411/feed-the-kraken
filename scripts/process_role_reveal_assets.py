import os
import glob
from collections import deque
from PIL import Image, ImageFilter

def flood_fill_outer_black(img, threshold=28, feather_radius=1):
    """
    Removes ONLY the outer black background using Breadth-First Search (BFS) from the image borders.
    Preserves 100% of internal dark textures, dark leather, and hand-inked crosshatching.
    """
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Step 1: Identify outer black pixels using BFS
    visited = set()
    queue = deque()

    def is_outer_dark(x, y):
        r, g, b, _ = pixels[x, y]
        return (r + g + b) / 3.0 < threshold

    # Seed the borders
    for x in range(width):
        if is_outer_dark(x, 0) and (x, 0) not in visited:
            visited.add((x, 0))
            queue.append((x, 0))
        if is_outer_dark(x, height - 1) and (x, height - 1) not in visited:
            visited.add((x, height - 1))
            queue.append((x, height - 1))

    for y in range(height):
        if is_outer_dark(0, y) and (0, y) not in visited:
            visited.add((0, y))
            queue.append((0, y))
        if is_outer_dark(width - 1, y) and (width - 1, y) not in visited:
            visited.add((width - 1, y))
            queue.append((width - 1, y))

    # BFS traversal
    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in neighbors:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited and is_outer_dark(nx, ny):
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Step 2: Create alpha mask
    mask = Image.new("L", (width, height), 255)
    mask_pixels = mask.load()
    for x, y in visited:
        mask_pixels[x, y] = 0

    if feather_radius > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    # Step 3: Apply mask to image
    img.putalpha(mask)

    # Step 4: Autocrop
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_kraken_eyes(img):
    """
    Process glowing kraken eyes so that black void is transparent and purple mist / glowing eyes are vibrant.
    """
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            max_c = max(r, g, b)
            if max_c < 14:
                pixels[x, y] = (r, g, b, 0)
            elif max_c < 35:
                alpha = int(((max_c - 14) / 21.0) * 200)
                pixels[x, y] = (r, g, b, alpha)
            else:
                alpha = min(255, int(max_c * 1.25))
                pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_all_assets():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\ee889917-0fa7-4ddf-b436-406bd887f6ae"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")

    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(sprites_dir, exist_ok=True)

    # 1. Card Tarot Back
    back_files = glob.glob(os.path.join(brain_dir, "card_tarot_back_raw_*.jpg"))
    if back_files:
        latest_back = max(back_files, key=os.path.getctime)
        print(f"Processing Tarot Back: {latest_back}")
        img = Image.open(latest_back)
        clean = flood_fill_outer_black(img, threshold=24, feather_radius=1)
        out_path = os.path.join(frames_dir, "card_tarot_back.png")
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

    # 2. Card Tarot Front
    front_files = glob.glob(os.path.join(brain_dir, "card_tarot_front_raw_*.jpg"))
    if front_files:
        latest_front = max(front_files, key=os.path.getctime)
        print(f"Processing Tarot Front: {latest_front}")
        img = Image.open(latest_front)
        clean = flood_fill_outer_black(img, threshold=26, feather_radius=1)
        out_path = os.path.join(frames_dir, "card_tarot_front.png")
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

    # 3. Kraken Eyes Glow
    eyes_files = glob.glob(os.path.join(brain_dir, "kraken_eyes_glow_raw_*.jpg"))
    if eyes_files:
        latest_eyes = max(eyes_files, key=os.path.getctime)
        print(f"Processing Kraken Eyes: {latest_eyes}")
        img = Image.open(latest_eyes)
        clean = process_kraken_eyes(img)
        out_path = os.path.join(sprites_dir, "kraken_eyes_glow.png")
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

    # 4. Faction Emblems Grid (2x2) with 25px inset to bypass grid divider lines
    emblems_files = glob.glob(os.path.join(brain_dir, "faction_emblems_grid_raw_*.jpg"))
    if emblems_files:
        latest_emblems = max(emblems_files, key=os.path.getctime)
        print(f"Processing Faction Emblems Grid: {latest_emblems}")
        grid_img = Image.open(latest_emblems)
        w, h = grid_img.size
        half_w, half_h = w // 2, h // 2
        inset = 30

        quadrants = [
            ("emblem_pirate.png", (inset, inset, half_w - inset, half_h - inset)),
            ("emblem_sailor.png", (half_w + inset, inset, w - inset, half_h - inset)),
            ("emblem_cult_leader.png", (inset, half_h + inset, half_w - inset, h - inset)),
            ("emblem_cultist.png", (half_w + inset, half_h + inset, w - inset, h - inset)),
        ]

        for name, crop_box in quadrants:
            quad = grid_img.crop(crop_box)
            clean_quad = flood_fill_outer_black(quad, threshold=28, feather_radius=1)
            out_quad_path = os.path.join(sprites_dir, name)
            clean_quad.save(out_quad_path, "PNG")
            print(f" -> Saved {out_quad_path} ({clean_quad.size})")

if __name__ == "__main__":
    process_all_assets()
