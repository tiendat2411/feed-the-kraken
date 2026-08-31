import os
from PIL import Image, ImageDraw, ImageOps, ImageFilter, ImageEnhance

def stylize_pirate_avatar(img_path, frame_img, target_size=(240, 240)):
    # 1. Load and center-crop to square
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    crop_box = (left, top, left + min_dim, top + min_dim)
    img_square = img.crop(crop_box).resize(target_size, Image.Resampling.LANCZOS)

    # 2. Stylize: High contrast, dark nautical sepia parchment look
    gray = ImageOps.grayscale(img_square)
    enhancer = ImageEnhance.Contrast(gray)
    high_contrast = enhancer.enhance(1.4)

    # Sepia / Warm Parchment colorization
    # Shadows = #1A1208, Midtones = #7A5B30, Highlights = #E6D2A8
    sepia = ImageOps.colorize(high_contrast, black="#1A1208", white="#E6D2A8", mid="#7A5B30")

    # 3. Create Circular Alpha Mask for inner portrait
    mask = Image.new("L", target_size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((10, 10, target_size[0] - 10, target_size[1] - 10), fill=255)

    # Soften mask edges
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))

    # 4. Composite Portrait with Alpha Mask
    portrait = sepia.convert("RGBA")
    portrait.putalpha(mask)

    # 5. Overlay Bronze Porthole Frame
    if frame_img:
        resized_frame = frame_img.resize(target_size, Image.Resampling.LANCZOS)
        final_avatar = Image.alpha_composite(portrait, resized_frame)
    else:
        final_avatar = portrait

    return final_avatar

def build_all_avatars():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ideas_dir = os.path.join(base_dir, "frontend", "src", "assets", "avatar-idea")
    avatars_out_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui", "avatars")
    os.makedirs(avatars_out_dir, exist_ok=True)

    # 1. Extract bronze porthole ring from crew_plate_wood.png
    crew_plate_path = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames", "crew_plate_wood.png")
    porthole_frame = None
    if os.path.exists(crew_plate_path):
        plate = Image.open(crew_plate_path).convert("RGBA")
        pw, ph = plate.size
        # The porthole ring on the left is ~ph wide and ph tall
        porthole_frame = plate.crop((0, 0, ph + 10, ph))

    # 2. Map of 11 Characters
    characters = {
        "captain-jack.jpg": "jack_sparrow.png",
        "Hector-Barbossa.jpg": "barbossa.png",
        "davy-jones.jpg": "davy_jones.png",
        "will-turner.jpg": "will_turner.png",
        "Elizabeth-Swann.jpg": "elizabeth_swann.png",
        "Tia-Dalma.jpg": "tia_dalma.png",
        "Joshamee-Gibbs.jpg": "gibbs.png",
        "Angelica.jpg": "angelica.png",
        "pintel.jpg": "pintel.png",
        "ragetti.jpg": "ragetti.png",
        "Jack-the-Monkey.jpg": "jack_monkey.png"
    }

    for src_file, out_file in characters.items():
        src_path = os.path.join(ideas_dir, src_file)
        if os.path.exists(src_path):
            avatar = stylize_pirate_avatar(src_path, porthole_frame)
            out_path = os.path.join(avatars_out_dir, out_file)
            avatar.save(out_path, "PNG")
            print(f"Generated Avatar: {out_file} -> {out_path}")

if __name__ == "__main__":
    build_all_avatars()
