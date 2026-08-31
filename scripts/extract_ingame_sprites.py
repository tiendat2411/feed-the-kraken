import os
from PIL import Image, ImageOps

def extract_sprites():
    brain_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\148d448d-6d95-4d9c-baa4-0b10b7ebb19a"
    sheet_path = os.path.join(brain_dir, "ingame_layout_sprites_sheet_1788005856300.jpg")
    
    if not os.path.exists(sheet_path):
        print(f"File not found: {sheet_path}")
        return

    img = Image.open(sheet_path).convert("RGBA")
    w, h = img.size
    print(f"Loaded sheet size: {w}x{h}")

    # Output directories
    frontend_dir = r"d:\PersonaPropjects\Feed The Kurumeo\feed-the-kraken\frontend\src\assets\ui"
    frames_dir = os.path.join(frontend_dir, "frames")
    sprites_dir = os.path.join(frontend_dir, "sprites")
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(sprites_dir, exist_ok=True)

    # Helper function to remove pure white/light background around isolated elements
    def clean_background(crop_img, threshold=240):
        # Convert to RGBA
        rgba = crop_img.convert("RGBA")
        datas = rgba.getdata()
        newData = []
        for item in datas:
            # Check if nearly white
            if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
                newData.append((255, 255, 255, 0)) # Fully transparent
            else:
                newData.append(item)
        rgba.putdata(newData)
        # Auto-crop bounding box of non-transparent pixels
        bbox = rgba.getbbox()
        if bbox:
            return rgba.crop(bbox)
        return rgba

    # 1. Circular Compass Table (Top-Left: x: 0..500, y: 0..500)
    box_table = (5, 5, 505, 505)
    crop_table = clean_background(img.crop(box_table), threshold=242)
    table_path = os.path.join(frames_dir, "compass_table_round.png")
    crop_table.save(table_path, "PNG")
    print(f"Saved compass_table_round: {crop_table.size} -> {table_path}")

    # 2. Drawer Pull Handle (Top-Right: x: 510..1020, y: 40..290)
    box_handle = (510, 45, 1020, 290)
    crop_handle = clean_background(img.crop(box_handle), threshold=242)
    handle_path = os.path.join(sprites_dir, "handle_drawer_brass.png")
    crop_handle.save(handle_path, "PNG")
    print(f"Saved handle_drawer_brass: {crop_handle.size} -> {handle_path}")

    # 3. Lieutenant Medal Badge (Center-Left: x: 510..720, y: 300..655)
    box_lt = (510, 300, 720, 655)
    crop_lt = clean_background(img.crop(box_lt), threshold=242)
    lt_path = os.path.join(sprites_dir, "badge_lieutenant_medal.png")
    crop_lt.save(lt_path, "PNG")
    print(f"Saved badge_lieutenant_medal: {crop_lt.size} -> {lt_path}")

    # 4. Navigator Pocket Compass (Center-Right: x: 730..1015, y: 300..655)
    box_nav = (730, 300, 1015, 655)
    crop_nav = clean_background(img.crop(box_nav), threshold=242)
    nav_path = os.path.join(sprites_dir, "badge_navigator_compass.png")
    crop_nav.save(nav_path, "PNG")
    print(f"Saved badge_navigator_compass: {crop_nav.size} -> {nav_path}")

    # 5. Silence Cut Tongue Icon (Bottom-Left: x: 100..380, y: 500..1000)
    box_silence = (100, 500, 380, 1000)
    crop_silence = clean_background(img.crop(box_silence), threshold=242)
    silence_path = os.path.join(sprites_dir, "icon_silence_cut_tongue.png")
    crop_silence.save(silence_path, "PNG")
    print(f"Saved icon_silence_cut_tongue: {crop_silence.size} -> {silence_path}")

    # 6. Off-duty Ocean Wave Icon (Bottom-Right: x: 560..1010, y: 670..1010)
    box_wave = (560, 670, 1010, 1010)
    crop_wave = clean_background(img.crop(box_wave), threshold=242)
    wave_path = os.path.join(sprites_dir, "icon_offduty_waves.png")
    crop_wave.save(wave_path, "PNG")
    print(f"Saved icon_offduty_waves: {crop_wave.size} -> {wave_path}")

if __name__ == "__main__":
    extract_sprites()
