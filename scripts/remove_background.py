import os
from PIL import Image

def remove_black_and_trim(img, threshold=20):
    """
    Tách nền đen/gần đen và tự động cắt sát viền mép (autocrop transparent edges).
    """
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            brightness = (r + g + b) / 3.0
            if brightness < threshold:
                alpha = int((brightness / threshold) * 255)
                pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def remove_white_and_trim(img, threshold=235):
    """
    Tách nền trắng/gần trắng và tự động cắt sát viền mép.
    """
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r > threshold and g > threshold and b > threshold:
                avg_diff = 255 - ((r + g + b) / 3.0)
                alpha = int((avg_diff / (255 - threshold)) * 255)
                pixels[x, y] = (r, g, b, alpha)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_atomic_assets():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ui_dir = os.path.join(base_dir, "frontend", "src", "assets", "ui")

    # 1. Clean Wood Panel (Note: Wood panel generated with white background)
    wood_in = os.path.join(brain_dir, "wood_panel_clean_1787917117561.jpg")
    wood_out = os.path.join(ui_dir, "frames", "wood_panel_clean.png")
    if os.path.exists(wood_in):
        img = Image.open(wood_in)
        clean = remove_white_and_trim(img, threshold=240)
        clean.save(wood_out, "PNG")
        print(f"Saved: {wood_out}")

    # 2. Clean Parchment Sheet (Black bg with nails)
    parchment_in = os.path.join(brain_dir, "parchment_sheet_clean_1787917237359.jpg")
    parchment_out = os.path.join(ui_dir, "frames", "parchment_sheet_clean.png")
    if os.path.exists(parchment_in):
        img = Image.open(parchment_in)
        clean = remove_black_and_trim(img, threshold=18)
        clean.save(parchment_out, "PNG")
        print(f"Saved: {parchment_out}")

    # 3. Clean Input Wood Slot (Black bg)
    input_in = os.path.join(brain_dir, "input_wood_slot_clean_1787917343999.jpg")
    input_out = os.path.join(ui_dir, "frames", "input_wood_slot_clean.png")
    if os.path.exists(input_in):
        img = Image.open(input_in)
        clean = remove_black_and_trim(img, threshold=18)
        clean.save(input_out, "PNG")
        print(f"Saved: {input_out}")

    # 4. Clean Candle Prop (Black bg)
    candle_in = os.path.join(brain_dir, "candle_prop_clean_1787917382675.jpg")
    candle_out = os.path.join(ui_dir, "sprites", "candle_prop_clean.png")
    if os.path.exists(candle_in):
        img = Image.open(candle_in)
        clean = remove_black_and_trim(img, threshold=15)
        clean.save(candle_out, "PNG")
        print(f"Saved: {candle_out}")

if __name__ == "__main__":
    process_atomic_assets()
