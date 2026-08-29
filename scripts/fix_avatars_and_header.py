import os
from PIL import Image, ImageDraw, ImageOps, ImageFilter, ImageEnhance

def compose_avatar(head_img, porthole_frame, size=300):
    hw, hh = head_img.size
    min_d = min(hw, hh)
    left = (hw - min_d) // 2
    top = (hh - min_d) // 2
    head_sq = head_img.crop((left, top, left + min_d, top + min_d)).resize((size, size), Image.Resampling.LANCZOS)

    gray = ImageOps.grayscale(head_sq)
    enhancer = ImageEnhance.Contrast(gray)
    contrast_gray = enhancer.enhance(1.3)
    parchment_portrait = ImageOps.colorize(contrast_gray, black="#1A1208", white="#E8D7B0", mid="#8A6B3D").convert("RGBA")

    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((8, 8, size - 8, size - 8), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    parchment_portrait.putalpha(mask)

    frame_resized = porthole_frame.resize((size, size), Image.Resampling.LANCZOS)
    final_avatar = Image.alpha_composite(parchment_portrait, frame_resized)
    return final_avatar

def fix_avatars_and_header():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")
    avatars_dir = os.path.join(ui_dir, "avatars")
    frames_dir = os.path.join(ui_dir, "frames")

    porthole_clean_path = os.path.join(frames_dir, "porthole_ring_clean.png")
    porthole_master = Image.open(porthole_clean_path).convert("RGBA")

    # Sheet 2: pirate_heads_group2_1787971419274.jpg (1920 x 1080)
    sheet2_path = os.path.join(brain_dir, "pirate_heads_group2_1787971419274.jpg")
    img2 = Image.open(sheet2_path)
    w, h = img2.size
    print(f"Sheet 2 size: {w} x {h}")

    # Row 1 (Top):
    # Gibbs: X: 50 to 580, Y: 20 to 560
    # Angelica: X: 640 to 1250, Y: 20 to 560
    # Pintel: X: 1300 to 1880, Y: 20 to 560

    # Row 2 (Bottom):
    # Ragetti: X: 400 to 950, Y: 500 to 1050
    # Jack Monkey: X: 980 to 1550, Y: 500 to 1050

    ragetti_crop = img2.crop((int(w * 0.20), int(h * 0.46), int(w * 0.52), int(h * 0.98)))
    ragetti_avatar = compose_avatar(ragetti_crop, porthole_master, size=300)
    ragetti_avatar.save(os.path.join(avatars_dir, "ragetti.png"), "PNG")
    print(f"Fixed Ragetti avatar: {ragetti_crop.size}")

    monkey_crop = img2.crop((int(w * 0.50), int(h * 0.48), int(w * 0.82), int(h * 0.98)))
    monkey_avatar = compose_avatar(monkey_crop, porthole_master, size=300)
    monkey_avatar.save(os.path.join(avatars_dir, "jack_monkey.png"), "PNG")
    print(f"Fixed Jack Monkey avatar: {monkey_crop.size}")

    # ── Darken and warm-tint wood_header_bar.png ──
    header_path = os.path.join(frames_dir, "wood_header_bar.png")
    header_img = Image.open(header_path).convert("RGBA")
    r, g, b, a = header_img.split()

    # Darken and enhance contrast to match dark chocolate weathered oak
    rgb = Image.merge("RGB", (r, g, b))
    enhancer_brightness = ImageEnhance.Brightness(rgb)
    darkened = enhancer_brightness.enhance(0.68)
    enhancer_contrast = ImageEnhance.Contrast(darkened)
    contrasted = enhancer_contrast.enhance(1.25)
    enhancer_color = ImageEnhance.Color(contrasted)
    colored = enhancer_color.enhance(1.15)

    final_header = Image.merge("RGBA", (*colored.split(), a))
    final_header.save(header_path, "PNG")
    print(f"Darkened and enriched Header Bar: {header_path}")

if __name__ == "__main__":
    fix_avatars_and_header()
