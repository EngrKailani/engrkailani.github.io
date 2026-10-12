"""Generate small, reusable homepage WebP assets without altering originals."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / "assets"
jobs = {
    "sls-rocket-kailani.jpeg": ("sls-rocket-kailani-mobile.webp", 480),
    "Arm.jpg": ("Arm-home.webp", 480),
    "nasa-sls-team.jpeg": ("nasa-sls-team-home.webp", 520),
    "nasa-astronaut-suit.jpeg": ("nasa-astronaut-suit-home.webp", 300),
    "nasa-mission-patches.jpeg": ("nasa-mission-patches-home.webp", 300),
    "nasa-mission-training-complex.jpeg": ("nasa-mission-training-complex-home.webp", 360),
    "cleanroom-suit.jpeg": ("cleanroom-suit-home.webp", 280),
    "graduation-flowers.jpeg": ("graduation-flowers-home.webp", 340),
    "engineering-awards.jpeg": ("engineering-awards-home.webp", 320),
    "space-helmet.jpeg": ("space-helmet-home.webp", 340),
}
for name, (dest, max_width) in jobs.items():
    with Image.open(source / name) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((max_width, 750), Image.Resampling.LANCZOS)
        target = source / dest
        im.save(target, "WEBP", quality=74, method=6)
        print(f"{name} => {dest}: {target.stat().st_size} bytes, {im.size}")
