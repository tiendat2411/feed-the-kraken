import os
import shutil

def delete_unused_assets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, "frontend", "src", "assets")

    unused_files = [
        os.path.join(assets_dir, "hero.png"),
        os.path.join(assets_dir, "react.svg"),
        os.path.join(assets_dir, "vite.svg"),
        os.path.join(assets_dir, "ui", "buttons", "home_buttons_plates.jpg"),
        os.path.join(assets_dir, "ui", "frames", "buttons_and_inputs.jpg"),
        os.path.join(assets_dir, "ui", "frames", "home_centerpiece_board.jpg"),
        os.path.join(assets_dir, "ui", "frames", "home_centerpiece_board.png"),
        os.path.join(assets_dir, "ui", "frames", "parchment_banner_tag.png"),
        os.path.join(assets_dir, "ui", "frames", "parchment_card.jpg"),
        os.path.join(assets_dir, "ui", "frames", "porthole_ring_clean.png"),
        os.path.join(assets_dir, "ui", "frames", "wood_panel.jpg"),
        os.path.join(assets_dir, "ui", "sprites", "vintage_candles.jpg")
    ]

    total_freed = 0
    deleted_count = 0

    for fpath in unused_files:
        if os.path.exists(fpath):
            size = os.path.getsize(fpath)
            os.remove(fpath)
            total_freed += size
            deleted_count += 1
            print(f"Deleted: {os.path.relpath(fpath, assets_dir)} ({size/1024.0:.1f} KB)")

    # Delete avatar-idea folder
    avatar_idea_dir = os.path.join(assets_dir, "avatar-idea")
    if os.path.exists(avatar_idea_dir):
        for root, dirs, files in os.walk(avatar_idea_dir):
            for f in files:
                total_freed += os.path.getsize(os.path.join(root, f))
                deleted_count += 1
        shutil.rmtree(avatar_idea_dir)
        print(f"Deleted folder: avatar-idea/")

    print(f"\nSuccessfully removed {deleted_count} unused asset files.")
    print(f"Total Disk Space Freed: {total_freed / (1024.0 * 1024.0):.2f} MB")

if __name__ == "__main__":
    delete_unused_assets()
