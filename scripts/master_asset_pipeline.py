import os
from PIL import Image, ImageDraw, ImageOps, ImageFilter, ImageEnhance
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

def make_porthole_frame(raw_path):
    img = Image.open(raw_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Center is at (w/2, h/2)
    cx, cy = w / 2.0, h / 2.0
    inner_radius = w * 0.31

    # Remove outer white
    clean = remove_outer_white(img, threshold=235)
    cw, ch = clean.size
    ccx, ccy = cw / 2.0, ch / 2.0
    c_pixels = clean.load()

    # Punch out inner circular hole
    for x in range(cw):
        for y in range(ch):
            dist = ((x - ccx)**2 + (y - ccy)**2)**0.5
            if dist < inner_radius:
                c_pixels[x, y] = (0, 0, 0, 0)
            elif dist < inner_radius + 4:
                # Soft inner edge
                fade = (dist - inner_radius) / 4.0
                r, g, b, a = c_pixels[x, y]
                c_pixels[x, y] = (r, g, b, int(a * fade))

    return clean

def compose_avatar(head_img, porthole_frame, size=300):
    # 1. Square crop head
    hw, hh = head_img.size
    min_d = min(hw, hh)
    left = (hw - min_d) // 2
    top = (hh - min_d) // 2
    head_sq = head_img.crop((left, top, left + min_d, top + min_d)).resize((size, size), Image.Resampling.LANCZOS)

    # 2. Colorize to antique parchment & dark ink
    gray = ImageOps.grayscale(head_sq)
    # Enhance lineart contrast
    enhancer = ImageEnhance.Contrast(gray)
    contrast_gray = enhancer.enhance(1.3)
    parchment_portrait = ImageOps.colorize(contrast_gray, black="#1A1208", white="#E8D7B0", mid="#8A6B3D").convert("RGBA")

    # 3. Circular Mask
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((8, 8, size - 8, size - 8), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    parchment_portrait.putalpha(mask)

    # 4. Composite Master Bronze Porthole Frame
    frame_resized = porthole_frame.resize((size, size), Image.Resampling.LANCZOS)
    final_avatar = Image.alpha_composite(parchment_portrait, frame_resized)
    return final_avatar

def build_perfect_assets():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")
    avatars_dir = os.path.join(ui_dir, "avatars")
    frames_dir = os.path.join(ui_dir, "frames")
    os.makedirs(avatars_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)

    # ── 1. Create Master Porthole Frame ──
    porthole_raw = os.path.join(brain_dir, "porthole_frame_master_1787971351252.jpg")
    porthole_master = make_porthole_frame(porthole_raw)
    porthole_master.save(os.path.join(frames_dir, "porthole_ring_clean.png"), "PNG")
    print(f"Master Porthole Frame created: {porthole_master.size}")

    # ── 2. Process Group 1 Avatars (Jack, Barbossa, Davy Jones, Will, Elizabeth, Tia Dalma) ──
    heads1_path = os.path.join(brain_dir, "pirate_heads_group1_1787971395768.jpg")
    img1 = Image.open(heads1_path)
    w1, h1 = img1.size
    cw1, ch1 = w1 / 3.0, h1 / 2.0

    group1_defs = [
        ("jack_sparrow.png", 0, 0),
        ("barbossa.png", 1, 0),
        ("davy_jones.png", 2, 0),
        ("will_turner.png", 0, 1),
        ("elizabeth_swann.png", 1, 1),
        ("tia_dalma.png", 2, 1),
    ]

    for name, c, r in group1_defs:
        crop_box = (int(c * cw1), int(r * ch1), int((c + 1) * cw1), int((r + 1) * ch1))
        head_crop = img1.crop(crop_box)
        avatar = compose_avatar(head_crop, porthole_master, size=300)
        out_file = os.path.join(avatars_dir, name)
        avatar.save(out_file, "PNG")
        print(f"Perfect Avatar: {name} -> {out_file}")

    # ── 3. Process Group 2 Avatars (Gibbs, Angelica, Pintel, Ragetti, Jack the Monkey) ──
    heads2_path = os.path.join(brain_dir, "pirate_heads_group2_1787971419274.jpg")
    img2 = Image.open(heads2_path)
    w2, h2 = img2.size
    cw2, ch2 = w2 / 3.0, h2 / 2.0

    group2_defs = [
        ("gibbs.png", 0, 0),
        ("angelica.png", 1, 0),
        ("pintel.png", 2, 0),
        ("ragetti.png", 0, 1),
        ("jack_monkey.png", 1, 1),
    ]

    for name, c, r in group2_defs:
        crop_box = (int(c * cw2), int(r * ch2), int((c + 1) * cw2), int((r + 1) * ch2))
        head_crop = img2.crop(crop_box)
        avatar = compose_avatar(head_crop, porthole_master, size=300)
        out_file = os.path.join(avatars_dir, name)
        avatar.save(out_file, "PNG")
        print(f"Perfect Avatar: {name} -> {out_file}")

    # ── 4. Build 14:1 Ultra-Wide Header Bar ──
    header_raw = os.path.join(brain_dir, "wood_header_bar_14x1_1787971328576.jpg")
    h_img = Image.open(header_raw)
    h_clean = remove_outer_white(h_img, threshold=238)
    hw, hh = h_clean.size

    # Target 14:1 ratio -> if height is hh, width = hh * 14
    target_h = 120
    target_w = target_h * 14  # 1680

    # Resize cleanly while preserving verdigris ends
    end_w = int(hh * 1.2)  # left and right bracket width
    left_end = h_clean.crop((0, 0, end_w, hh)).resize((int(target_h * 1.2), target_h), Image.Resampling.LANCZOS)
    right_end = h_clean.crop((hw - end_w, 0, hw, hh)).resize((int(target_h * 1.2), target_h), Image.Resampling.LANCZOS)
    center_wood = h_clean.crop((end_w, 0, hw - end_w, hh)).resize((target_w - 2 * left_end.width, target_h), Image.Resampling.LANCZOS)

    header_14x1 = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    header_14x1.paste(left_end, (0, 0), left_end)
    header_14x1.paste(center_wood, (left_end.width, 0), center_wood)
    header_14x1.paste(right_end, (target_w - right_end.width, 0), right_end)

    header_out = os.path.join(frames_dir, "wood_header_bar.png")
    header_14x1.save(header_out, "PNG")
    print(f"Header 14:1 saved: {header_out} ({header_14x1.size})")

    # ── 5. Fix Crew Plate (Crop cleanly & Punch Porthole Hole) ──
    plates_raw = os.path.join(brain_dir, "lobby_ui_plates_1787924437061.jpg")
    p_img = Image.open(plates_raw)
    pw, ph = p_img.size

    # Clean crop item 2 (Y: 280 to 480)
    crew_crop = p_img.crop((0, 280, pw, 480))
    crew_clean = remove_outer_white(crew_crop, threshold=238)
    cw, ch = crew_clean.size

    # Punch out inner circle of left porthole hole
    # In crew_clean, the left porthole is at center X ~ ch/2 + 10, Y ~ ch/2
    hole_cx = ch / 2.0 + 8
    hole_cy = ch / 2.0
    hole_radius = ch * 0.32
    cp_pixels = crew_clean.load()

    for x in range(int(ch + 20)):
        for y in range(ch):
            dist = ((x - hole_cx)**2 + (y - hole_cy)**2)**0.5
            if dist < hole_radius:
                cp_pixels[x, y] = (0, 0, 0, 0)

    crew_out = os.path.join(frames_dir, "crew_plate_wood.png")
    crew_clean.save(crew_out, "PNG")
    print(f"Crew Plate fixed & punched: {crew_out} ({crew_clean.size})")

if __name__ == "__main__":
    build_perfect_assets()
