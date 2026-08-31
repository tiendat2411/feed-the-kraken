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

def build_ultrawide_warm_header(source_img_path, target_width=1680, target_height=120):
    raw_img = Image.open(source_img_path)
    clean_beam = remove_all_white_pockets(raw_img, threshold=238)
    bw, bh = clean_beam.size
    print(f"Clean Source Beam: {bw} x {bh}")

    # Corner cap width (left and right verdigris brackets)
    cap_w = int(bh * 0.9)  # ~110px

    left_cap = clean_beam.crop((0, 0, cap_w, bh)).resize((int(target_height * 0.95), target_height), Image.Resampling.LANCZOS)
    right_cap = clean_beam.crop((bw - cap_w, 0, bw, bh)).resize((int(target_height * 0.95), target_height), Image.Resampling.LANCZOS)

    # Middle center oak slice
    center_slice = clean_beam.crop((cap_w, 0, bw - cap_w, bh))
    middle_width = target_width - left_cap.width - right_cap.width
    stretched_middle = center_slice.resize((middle_width, target_height), Image.Resampling.LANCZOS)

    final_header = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    final_header.paste(left_cap, (0, 0))
    final_header.paste(stretched_middle, (left_cap.width, 0))
    final_header.paste(right_cap, (left_cap.width + middle_width, 0))

    return final_header

def process_all_v2():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "sprites")
    frames_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames")
    os.makedirs(sprites_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)

    # 1. Process Components Sheet
    sheet_raw = os.path.join(brain_dir, "game_header_components_v2_1787994741880.jpg")
    img = Image.open(sheet_raw)
    w, h = img.size
    hw, hh = w // 2, h // 2

    # Top-Left: Room Code Cartouche Plaque
    plate_crop = img.crop((0, 0, hw, hh))
    plate_clean = remove_all_white_pockets(plate_crop, threshold=235)
    plate_out = os.path.join(frames_dir, "plate_room_code.png")
    plate_clean.save(plate_out, "PNG")
    print(f"Saved Room Code Plaque: {plate_out} {plate_clean.size}")

    # Top-Right: Flat Nailed Parchment Sheet
    nailed_crop = img.crop((hw, 0, w, hh))
    nailed_clean = remove_all_white_pockets(nailed_crop, threshold=235)
    nailed_out = os.path.join(frames_dir, "parchment_nailed_plate.png")
    nailed_clean.save(nailed_out, "PNG")
    print(f"Saved Nailed Parchment: {nailed_out} {nailed_clean.size}")

    # Bottom-Left: Large Glowing Compass Rose
    compass_crop = img.crop((0, hh, hw, h))
    compass_clean = remove_all_white_pockets(compass_crop, threshold=235)
    compass_out = os.path.join(sprites_dir, "badge_compass_rose.png")
    compass_clean.save(compass_out, "PNG")
    print(f"Saved Large Compass Rose: {compass_out} {compass_clean.size}")

    # Bottom-Right: Ship Voyage Medallion
    ship_crop = img.crop((hw, hh, w, h))
    ship_clean = remove_all_white_pockets(ship_crop, threshold=235)
    ship_out = os.path.join(sprites_dir, "badge_ship_voyage.png")
    ship_clean.save(ship_out, "PNG")
    print(f"Saved Ship Voyage Medallion: {ship_out} {ship_clean.size}")

    # 2. Build Warm Oak 14:1 Header Bar
    oak_raw = os.path.join(brain_dir, "wood_header_bar_warm_oak_1787994763908.jpg")
    header_14x1 = build_ultrawide_warm_header(oak_raw, target_width=1680, target_height=120)
    header_out = os.path.join(frames_dir, "wood_header_bar.png")
    header_14x1.save(header_out, "PNG")
    print(f"Saved Warm Oak 14:1 Header Bar: {header_out} {header_14x1.size}")

if __name__ == "__main__":
    process_all_v2()
