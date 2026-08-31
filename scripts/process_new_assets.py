import os
from PIL import Image
from collections import deque

def remove_outer_white(img, threshold=235):
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False for _ in range(h)] for _ in range(w)]
    q = deque()

    # Enqueue all boundary pixels
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

    # Apply transparency to background pixels
    for x in range(w):
        for y in range(h):
            if bg_mask[x][y]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Feather edges
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and bg_mask[nx][ny]:
                        is_edge = True
                        break
                if is_edge:
                    r, g, b, a = pixels[x, y]
                    if r > threshold - 15 and g > threshold - 15 and b > threshold - 15:
                        avg = (r + g + b) / 3.0
                        alpha = int(max(0, (255 - avg) / (255 - threshold + 15)) * 255)
                        pixels[x, y] = (r, g, b, alpha)

    # Autocrop
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_new_assets():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")

    # 1. Process Buttons Pair
    btn_pair_in = os.path.join(brain_dir, "buttons_unified_pair_1787920691640.jpg")
    if os.path.exists(btn_pair_in):
        pair_img = Image.open(btn_pair_in)
        w, h = pair_img.size

        # Top Button (Gold)
        gold_crop = pair_img.crop((0, 0, w, int(h * 0.50)))
        gold_clean = remove_outer_white(gold_crop, threshold=240)
        gold_out = os.path.join(ui_dir, "buttons", "button_gold_plate.png")
        gold_clean.save(gold_out, "PNG")
        print(f"Saved: {gold_out} (Size: {gold_clean.size})")

        # Bottom Button (Wood)
        wood_crop = pair_img.crop((0, int(h * 0.50), w, h))
        wood_clean = remove_outer_white(wood_crop, threshold=240)
        wood_out = os.path.join(ui_dir, "buttons", "button_wood_plate.png")
        wood_clean.save(wood_out, "PNG")
        print(f"Saved: {wood_out} (Size: {wood_clean.size})")

    # 2. Process Sleek Input Slot
    input_in = os.path.join(brain_dir, "input_slot_sleek_1787920770938.jpg")
    if os.path.exists(input_in):
        input_img = Image.open(input_in)
        input_clean = remove_outer_white(input_img, threshold=240)
        input_out = os.path.join(ui_dir, "frames", "input_wood_slot_clean.png")
        input_clean.save(input_out, "PNG")
        print(f"Saved: {input_out} (Size: {input_clean.size})")

if __name__ == "__main__":
    process_new_assets()
