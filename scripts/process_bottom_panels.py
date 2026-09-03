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
        # Check if near white
        return r > threshold and g > threshold and b > threshold

    # Seed the borders
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
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")
    os.makedirs(frames_dir, exist_ok=True)

    # 1. Pirates Gathering Plank
    pirate_files = glob.glob(os.path.join(brain_dir, "pirates_gathering_plank_raw_*.jpg"))
    if pirate_files:
        latest_pirate = max(pirate_files, key=os.path.getctime)
        print(f"Processing Pirate Plank: {latest_pirate}")
        img_pirate = Image.open(latest_pirate)
        clean_pirate = flood_fill_outer_white(img_pirate, threshold=230, feather_radius=1)
        out_pirate = os.path.join(frames_dir, "panel_pirates_gathering.png")
        clean_pirate.save(out_pirate, "PNG")
        w, h = clean_pirate.size
        print(f" -> Saved {out_pirate} ({w}x{h}, aspect ratio: {w/h:.2f}:1)")

    # 2. All Eyes Closed Frame
    eyes_files = glob.glob(os.path.join(brain_dir, "all_eyes_closed_frame_raw_*.jpg"))
    if eyes_files:
        latest_eyes = max(eyes_files, key=os.path.getctime)
        print(f"Processing All Eyes Closed: {latest_eyes}")
        img_eyes = Image.open(latest_eyes)
        clean_eyes = flood_fill_outer_white(img_eyes, threshold=230, feather_radius=1)
        out_eyes = os.path.join(frames_dir, "panel_all_eyes_closed.png")
        clean_eyes.save(out_eyes, "PNG")
        w, h = clean_eyes.size
        print(f" -> Saved {out_eyes} ({w}x{h}, aspect ratio: {w/h:.2f}:1)")

if __name__ == "__main__":
    main()
