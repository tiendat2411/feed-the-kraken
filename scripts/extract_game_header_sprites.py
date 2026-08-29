import os
from PIL import Image
from collections import deque

def remove_all_white_pockets(img, threshold=235):
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    visited = [[False for _ in range(h)] for _ in range(w)]

    for x in range(w):
        for y in range(h):
            if visited[x][y]:
                continue
            r, g, b, a = pixels[x, y]
            if r > threshold and g > threshold and b > threshold:
                component = []
                q = deque([(x, y)])
                visited[x][y] = True

                while q:
                    cx, cy = q.popleft()
                    component.append((cx, cy))
                    for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                            nr, ng, nb, na = pixels[nx, ny]
                            if nr > threshold and ng > threshold and nb > threshold:
                                visited[nx][ny] = True
                                q.append((nx, ny))

                for px, py in component:
                    pixels[px, py] = (0, 0, 0, 0)

    # Clean antialiased border pixels
    for x in range(w):
        for y in range(h):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_near_transparent = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and pixels[nx, ny][3] == 0:
                        is_near_transparent = True
                        break
                if is_near_transparent and r > threshold - 25 and g > threshold - 25 and b > threshold - 25:
                    avg = (r + g + b) / 3.0
                    alpha = int(max(0, (255 - avg) / (255 - threshold + 25)) * 255)
                    pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def extract_header_sprites():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")
    os.makedirs(sprites_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)

    sheet_raw = os.path.join(brain_dir, "game_header_sprites_sheet_1787993009180.jpg")
    img = Image.open(sheet_raw)
    w, h = img.size
    hw, hh = w // 2, h // 2

    # 1. Top-Left: Sound On Icon
    sound_on_crop = img.crop((0, 0, hw, hh))
    sound_on_clean = remove_all_white_pockets(sound_on_crop, threshold=235)
    sound_on_out = os.path.join(sprites_dir, "icon_sound_on.png")
    sound_on_clean.save(sound_on_out, "PNG")
    print(f"Saved Sound On: {sound_on_out} {sound_on_clean.size}")

    # 2. Top-Right: Sound Off Icon
    sound_off_crop = img.crop((hw, 0, w, hh))
    sound_off_clean = remove_all_white_pockets(sound_off_crop, threshold=235)
    sound_off_out = os.path.join(sprites_dir, "icon_sound_off.png")
    sound_off_clean.save(sound_off_out, "PNG")
    print(f"Saved Sound Off: {sound_off_out} {sound_off_clean.size}")

    # 3. Bottom-Left: Compass Rose Medallion
    compass_crop = img.crop((0, hh, hw, h))
    compass_clean = remove_all_white_pockets(compass_crop, threshold=235)
    compass_out = os.path.join(sprites_dir, "badge_compass_rose.png")
    compass_clean.save(compass_out, "PNG")
    print(f"Saved Compass Rose: {compass_out} {compass_clean.size}")

    # 4. Bottom-Right: Parchment Banner Ribbon Plaque
    banner_crop = img.crop((hw, hh, w, h))
    banner_clean = remove_all_white_pockets(banner_crop, threshold=235)
    banner_out = os.path.join(frames_dir, "parchment_banner_tag.png")
    banner_clean.save(banner_out, "PNG")
    print(f"Saved Parchment Banner: {banner_out} {banner_clean.size}")

if __name__ == "__main__":
    extract_header_sprites()
