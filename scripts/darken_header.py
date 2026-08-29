import os
from PIL import Image, ImageEnhance

def darken_header():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    header_path = os.path.join(base_dir, "frontend", "src", "assets", "ui", "frames", "wood_header_bar.png")
    img = Image.open(header_path).convert("RGBA")
    r, g, b, a = img.split()

    rgb = Image.merge("RGB", (r, g, b))
    enhancer_brightness = ImageEnhance.Brightness(rgb)
    darkened = enhancer_brightness.enhance(0.75)  # Darken further

    enhancer_contrast = ImageEnhance.Contrast(darkened)
    contrasted = enhancer_contrast.enhance(1.20)  # Rich wood grain

    final_header = Image.merge("RGBA", (*contrasted.split(), a))
    final_header.save(header_path, "PNG")
    print(f"Deep dark Header Bar saved: {header_path}")

if __name__ == "__main__":
    darken_header()
