import os
from PIL import Image
from collections import deque

def analyze_and_clean_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # 1. Sample border pixels to detect background regions
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

    # Check if a pixel is outside background
    # Parchment is warm yellow/brown (R > 130, G > 100, B > 60 with R > B + 30)
    # Background in Imagen is pure black (brightness < 35) or pure white (brightness > 230) or neutral grey
    def is_background(r, g, b):
        brightness = (r + g + b) / 3.0
        # Dark background
        if brightness < 40:
            return True
        # White or neutral grey/checkerboard background
        if brightness > 220:
            return True
        # Grey checkerboard (r ~= g ~= b with no warm saturation)
        if abs(r - g) < 10 and abs(g - b) < 10 and brightness > 120:
            return True
        return False

    bg_mask = [[False for _ in range(h)] for _ in range(w)]

    while q:
        cx, cy = q.popleft()
        r, g, b, a = pixels[cx, cy]

        if is_background(r, g, b):
            bg_mask[cx][cy] = True
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # Apply alpha: if bg_mask is True -> alpha = 0
    for x in range(w):
        for y in range(h):
            if bg_mask[x][y]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                r, g, b, a = pixels[x, y]
                # Defringe white/black borders
                # Check neighbors to see if on edge
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and bg_mask[nx][ny]:
                        is_edge = True
                        break
                if is_edge:
                    # Soft feathering
                    brightness = (r + g + b) / 3.0
                    if brightness > 220:
                        pixels[x, y] = (r, g, b, 0)
                    elif brightness < 30:
                        pixels[x, y] = (r, g, b, 0)

    # Autocrop
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Cleaned and saved: {output_path}")

if __name__ == "__main__":
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")

    # 1. Wood Panel
    wood_in = os.path.join(brain_dir, "wood_panel_clean_1787917117561.jpg")
    wood_out = os.path.join(ui_dir, "frames", "wood_panel_clean.png")
    analyze_and_clean_image(wood_in, wood_out)

    # 2. Parchment Sheet
    parchment_in = os.path.join(brain_dir, "parchment_sheet_clean_1787917237359.jpg")
    parchment_out = os.path.join(ui_dir, "frames", "parchment_sheet_clean.png")
    analyze_and_clean_image(parchment_in, parchment_out)

    # 3. Input Wood Slot
    input_in = os.path.join(brain_dir, "input_wood_slot_clean_1787917343999.jpg")
    input_out = os.path.join(ui_dir, "frames", "input_wood_slot_clean.png")
    analyze_and_clean_image(input_in, input_out)

    # 4. Candle Prop
    candle_in = os.path.join(brain_dir, "candle_prop_clean_1787917382675.jpg")
    candle_out = os.path.join(ui_dir, "sprites", "candle_prop_clean.png")
    analyze_and_clean_image(candle_in, candle_out)
