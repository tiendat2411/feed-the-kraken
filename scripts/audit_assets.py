import os
import re

def audit_assets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_src = os.path.join(base_dir, "frontend", "src")
    assets_dir = os.path.join(frontend_src, "assets")

    # 1. Collect all code files (.js, .jsx, .css, .html, .json)
    code_files = []
    for root, dirs, files in os.walk(frontend_src):
        for f in files:
            if f.endswith(('.js', '.jsx', '.css', '.html', '.json', '.ts', '.tsx')):
                code_files.append(os.path.join(root, f))
    
    index_html = os.path.join(base_dir, "frontend", "index.html")
    if os.path.exists(index_html):
        code_files.append(index_html)

    # Read all code contents into a single searchable buffer
    code_contents = ""
    for cf in code_files:
        try:
            with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
                code_contents += "\n" + f.read()
        except Exception as e:
            print(f"Error reading {cf}: {e}")

    # 2. Collect all asset files
    all_assets = []
    for root, dirs, files in os.walk(assets_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, assets_dir)
            all_assets.append((full_path, f, rel_path))

    print(f"Total Assets found: {len(all_assets)}")

    used_assets = []
    unused_assets = []

    for full_path, filename, rel_path in all_assets:
        # Check if filename or rel_path is referenced in code
        name_no_ext = os.path.splitext(filename)[0]
        # Regex search for filename in code
        if filename in code_contents or rel_path.replace('\\', '/') in code_contents:
            used_assets.append((full_path, filename, rel_path))
        else:
            unused_assets.append((full_path, filename, rel_path))

    print("\n--- USED ASSETS ---")
    for _, fn, rp in used_assets:
        print(f"  [USED] {rp}")

    print(f"\nTotal Used: {len(used_assets)}")

    print("\n--- UNUSED ASSETS ---")
    for _, fn, rp in unused_assets:
        size_kb = os.path.getsize(_) / 1024.0
        print(f"  [UNUSED] {rp} ({size_kb:.1f} KB)")

    print(f"\nTotal Unused: {len(unused_assets)}")

if __name__ == "__main__":
    audit_assets()
