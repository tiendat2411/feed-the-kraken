import os
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
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

def process_lobby_assets():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")
    os.makedirs(os.path.join(ui_dir, "frames"), exist_ok=True)
    os.makedirs(os.path.join(ui_dir, "buttons"), exist_ok=True)
    os.makedirs(os.path.join(ui_dir, "avatars"), exist_ok=True)

    # 1. Process Lobby UI Plates (Header, Crew Plate, Helm Button)
    plates_in = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    if os.path.exists(plates_in):
        img = Image.open(plates_in)
        w, h = img.size

        # Top: Header Bar (Y: 0 to 33%)
        header_crop = img.crop((0, 0, w, int(h * 0.33)))
        header_clean = remove_outer_white(header_crop, threshold=238)
        header_out = os.path.join(ui_dir, "frames", "wood_header_bar.png")
        header_clean.save(header_out, "PNG")
        print(f"Saved Header Bar: {header_out} {header_clean.size}")

        # Middle: Crew Plate Bar (Y: 33% to 64%)
        crew_crop = img.crop((0, int(h * 0.33), w, int(h * 0.64)))
        crew_clean = remove_outer_white(crew_crop, threshold=238)
        crew_out = os.path.join(ui_dir, "frames", "crew_plate_wood.png")
        crew_clean.save(crew_out, "PNG")
        print(f"Saved Crew Plate: {crew_out} {crew_clean.size}")

        # Bottom: Helm Button (Y: 64% to 100%)
        helm_crop = img.crop((0, int(h * 0.64), w, h))
        helm_clean = remove_outer_white(helm_crop, threshold=238)
        helm_out = os.path.join(ui_dir, "buttons", "button_helm_gold.png")
        helm_clean.save(helm_out, "PNG")
        print(f"Saved Helm Button: {helm_out} {helm_clean.size}")

    # 2. Process Map Cards Pair
    maps_in = os.path.join(brain_dir, "map_cards_pair_1787924516932.jpg")
    if os.path.exists(maps_in):
        img = Image.open(maps_in)
        w, h = img.size

        # Left: Quick Journey (X: 0 to 50%)
        quick_crop = img.crop((0, 0, int(w * 0.50), h))
        quick_clean = remove_outer_white(quick_crop, threshold=238)
        quick_out = os.path.join(ui_dir, "frames", "map_card_quick.png")
        quick_clean.save(quick_out, "PNG")
        print(f"Saved Quick Map: {quick_out} {quick_clean.size}")

        # Right: Long Journey (X: 50% to 100%)
        long_crop = img.crop((int(w * 0.50), 0, w, h))
        long_clean = remove_outer_white(long_crop, threshold=238)
        long_out = os.path.join(ui_dir, "frames", "map_card_long.png")
        long_clean.save(long_out, "PNG")
        print(f"Saved Long Map: {long_out} {long_clean.size}")

if __name__ == "__main__":
    process_lobby_assets()
