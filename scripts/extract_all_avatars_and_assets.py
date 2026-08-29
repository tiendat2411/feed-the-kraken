import os
from PIL import Image, ImageDraw, ImageOps, ImageFilter
from collections import deque

def remove_outer_white_clean(img, threshold=235):
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

def extract_all():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")
    avatars_dir = os.path.join(ui_dir, "avatars")
    sprites_dir = os.path.join(ui_dir, "sprites")
    bg_dir = os.path.join(ui_dir, "backgrounds")
    os.makedirs(avatars_dir, exist_ok=True)
    os.makedirs(sprites_dir, exist_ok=True)
    os.makedirs(bg_dir, exist_ok=True)

    # 1. Save Lobby Cabin Background
    bg_src = os.path.join(brain_dir, "lobby_cabin_bg_1787969268849.jpg")
    if os.path.exists(bg_src):
        bg_img = Image.open(bg_src)
        bg_out = os.path.join(bg_dir, "lobby_cabin_bg.jpg")
        bg_img.save(bg_out, "JPEG", quality=95)
        print(f"Saved Background: {bg_out}")

    # 2. Extract Avatars from Sheet Part 1 (3x2 grid: Jack, Barbossa, Davy Jones, Will, Elizabeth, Tia Dalma)
    sheet1_src = os.path.join(brain_dir, "pirate_portraits_sheet_1787969334972.jpg")
    if os.path.exists(sheet1_src):
        img1 = Image.open(sheet1_src)
        w, h = img1.size
        cw, ch = w / 3.0, h / 2.0

        avatars1 = [
            ("jack_sparrow.png", 0, 0),
            ("barbossa.png", 1, 0),
            ("davy_jones.png", 2, 0),
            ("will_turner.png", 0, 1),
            ("elizabeth_swann.png", 1, 1),
            ("tia_dalma.png", 2, 1),
        ]

        for name, col, row in avatars1:
            crop_box = (int(col * cw), int(row * ch), int((col + 1) * cw), int((row + 1) * ch))
            cropped = img1.crop(crop_box)
            clean = remove_outer_white_clean(cropped, threshold=235)
            out_path = os.path.join(avatars_dir, name)
            clean.save(out_path, "PNG")
            print(f"Saved Avatar: {name} -> {out_path} ({clean.size})")

    # 3. Extract Avatars and Crown from Sheet Part 2 (3x2 grid: Gibbs, Angelica, Pintel, Ragetti, Jack the Monkey, Crown)
    sheet2_src = os.path.join(brain_dir, "pirate_portraits_sheet_part2_1787969355520.jpg")
    if os.path.exists(sheet2_src):
        img2 = Image.open(sheet2_src)
        w, h = img2.size
        cw, ch = w / 3.0, h / 2.0

        avatars2 = [
            ("gibbs.png", 0, 0),
            ("angelica.png", 1, 0),
            ("pintel.png", 2, 0),
            ("ragetti.png", 0, 1),
            ("jack_monkey.png", 1, 1),
        ]

        for name, col, row in avatars2:
            crop_box = (int(col * cw), int(row * ch), int((col + 1) * cw), int((row + 1) * ch))
            cropped = img2.crop(crop_box)
            clean = remove_outer_white_clean(cropped, threshold=235)
            out_path = os.path.join(avatars_dir, name)
            clean.save(out_path, "PNG")
            print(f"Saved Avatar: {name} -> {out_path} ({clean.size})")

        # Crown Badge (Col 2, Row 1)
        crown_crop = img2.crop((int(2 * cw), int(1 * ch), w, h))
        crown_clean = remove_outer_white_clean(crown_crop, threshold=235)
        crown_out = os.path.join(sprites_dir, "crown_gold_badge.png")
        crown_clean.save(crown_out, "PNG")
        print(f"Saved Crown Badge: {crown_out} ({crown_clean.size})")

if __name__ == "__main__":
    extract_all()
