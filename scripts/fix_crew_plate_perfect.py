import os
from PIL import Image, ImageDraw, ImageFilter
from collections import deque

def remove_outer_white_tracked(img, threshold=235):
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
    return img, bbox

def fix_crew_plate_perfect():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")

    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)

    # 1. Clean crop of crew plate (Y: 275 to 485)
    crew_crop = p_img.crop((0, 275, p_img.width, 485))

    # Track outer white removal and bbox
    cleaned_img, bbox = remove_outer_white_tracked(crew_crop, threshold=238)
    cropped_clean = cleaned_img.crop(bbox)
    cw, ch = cropped_clean.size
    print(f"Cropped Clean Plate: {cw} x {ch}, bbox in raw crop: {bbox}")

    # ── Let's find the exact center of the left porthole in cropped_clean ──
    # The left bronze ring is in X: 0 to ~210.
    # The inner circle is the white/light region inside the ring.
    # Left ring outer X is 0 to ~200, center is at X ~ 100.5, Y ~ ch/2 = 101.0
    left_cx = 100.5
    left_cy = ch / 2.0
    left_inner_r = 52.0  # inner radius of the bronze porthole ring

    # Right jewel socket center in cropped_clean:
    # In raw crop, gem centroid was (1261.0, 111.0).
    right_cx = 1261.0 - bbox[0]
    right_cy = 111.0 - bbox[1]
    right_inner_r = 36.5

    print(f"Left Porthole Hole Center: ({left_cx}, {left_cy}), Radius: {left_inner_r}")
    print(f"Right Gem Hole Center: ({right_cx}, {right_cy}), Radius: {right_inner_r}")

    cp_pixels = cropped_clean.load()

    for x in range(cw):
        for y in range(ch):
            # 1. Punch left porthole hole
            if x < cw * 0.25:
                dist_left = ((x - left_cx)**2 + (y - left_cy)**2)**0.5
                if dist_left < left_inner_r:
                    cp_pixels[x, y] = (0, 0, 0, 0)
                elif dist_left < left_inner_r + 2:
                    fade = (dist_left - left_inner_r) / 2.0
                    r, g, b, a = cp_pixels[x, y]
                    cp_pixels[x, y] = (r, g, b, int(a * fade))

            # 2. Punch right gem hole
            if x > cw * 0.75:
                dist_right = ((x - right_cx)**2 + (y - right_cy)**2)**0.5
                if dist_right < right_inner_r:
                    cp_pixels[x, y] = (0, 0, 0, 0)
                elif dist_right < right_inner_r + 2:
                    fade = (dist_right - right_inner_r) / 2.0
                    r, g, b, a = cp_pixels[x, y]
                    cp_pixels[x, y] = (r, g, b, int(a * fade))

    plate_path = os.path.join(frames_dir, "crew_plate_wood.png")
    cropped_clean.save(plate_path, "PNG")
    print(f"Perfect Crew Plate saved: {plate_path} ({cropped_clean.size})")

if __name__ == "__main__":
    fix_crew_plate_perfect()
