import os
import glob
from collections import deque
from PIL import Image, ImageFilter

def flood_fill_outer_black(img, threshold=24, feather_radius=1):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

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

    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in neighbors:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited and is_outer_dark(nx, ny):
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

def process_role_titles():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\ee889917-0fa7-4ddf-b436-406bd887f6ae"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")
    os.makedirs(sprites_dir, exist_ok=True)

    files = glob.glob(os.path.join(brain_dir, "role_titles_typography_raw_*.jpg"))
    if not files:
        print("No typography file found!")
        return

    latest_file = max(files, key=os.path.getctime)
    print(f"Processing Role Titles: {latest_file}")
    img = Image.open(latest_file)
    w, h = img.size

    # Precise bands based on detected pixel gaps
    rows = [
        ("title_role_pirate.png", (0, 15, w, 230)),
        ("title_role_sailor.png", (0, 235, w, 460)),
        ("title_role_cult_leader.png", (0, 470, w, 670)),
        ("title_role_cultist.png", (0, 680, w, 870)),
    ]

    for name, crop_box in rows:
        band = img.crop(crop_box)
        clean = flood_fill_outer_black(band, threshold=24, feather_radius=1)
        out_path = os.path.join(sprites_dir, name)
        clean.save(out_path, "PNG")
        print(f" -> Saved {out_path} ({clean.size})")

if __name__ == "__main__":
    process_role_titles()
