"""Build branded 1200×630 social-sharing previews from existing project artwork and photos.

All diagrams are derived from the portfolio's own project thumbnails.
Illustrative images are not presented as experimental measurements.
Requires: Pillow, librsvg2-bin (rsvg-convert).
"""
from __future__ import annotations

import html
import re
import subprocess
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "social"
DEST.mkdir(exist_ok=True)
DIRECTORY = (ROOT / "projects/index.html").read_text(encoding="utf-8")
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
DARK = "#211b2b"
PAPER = "#fcf4f8"
PINK = "#f0b2d0"
MUTED = "#c8b4ca"
TURQUOISE = "#86d3c8"
WIDTH, HEIGHT = 1200, 630


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def draw_lines(draw: ImageDraw.ImageDraw, text: str, left: int, top: int,
               max_width: int, size: int, fill: str, bold: bool = True,
               spacing: int = 11, limit: int = 4) -> int:
    """Wrap without changing the engineering claim or inserting ellipses."""
    words, lines, current = text.split(), [], ""
    f = font(size, bold)
    for word in words:
        trial = word if not current else current + " " + word
        if draw.textlength(trial, font=f) > max_width and current:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    if len(lines) > limit:
        return draw_lines(draw, text, left, top, max_width,
                          max(21, size - 5), fill, bold, spacing, limit)
    for line in lines:
        draw.text((left, top), line, font=f, fill=fill)
        top += size + spacing
    return top


def base(label: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new("RGB", (WIDTH, HEIGHT), DARK)
    d = ImageDraw.Draw(im)
    # A restrained editorial frame, using the site's plum and blush palette.
    d.rounded_rectangle((23, 23, WIDTH - 24, HEIGHT - 24), radius=26,
                        outline="#725a79", width=2)
    d.line((50, 105, 1150, 105), fill="#71516e", width=2)
    d.text((54, 51), "KAILANI ALARCON", font=font(27, True), fill=PAPER)
    d.text((1147, 59), label.upper(), font=font(17, True),
           fill=PINK, anchor="ra")
    d.line((52, 540, 1148, 540), fill="#59465d", width=2)
    d.text((54, 565), "ENGINEERING  /  ROBOTICS  /  SYSTEMS", font=font(17),
           fill=MUTED)
    d.text((1148, 565), "ENGRKAILANI.GITHUB.IO", font=font(17, True),
           fill=PINK, anchor="ra")
    return im, d


def art(source: Path, width: int = 628, height: int = 360) -> Image.Image:
    if source.suffix.lower() == ".svg":
        result = subprocess.run(
            ["rsvg-convert", "--width", str(width), "--height", str(height), str(source)],
            check=True, capture_output=True,
        )
        artwork = Image.open(BytesIO(result.stdout)).convert("RGBA")
    else:
        # The VNA directory entry intentionally uses an equipment photograph.
        artwork = Image.open(source).convert("RGBA")
    return ImageOps.contain(artwork, (width, height), Image.Resampling.LANCZOS)


def place_art(im: Image.Image, svg: Path, area: tuple[int, int, int, int]) -> None:
    x, y, right, bottom = area
    width, height = right - x, bottom - y
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(area, radius=21, fill="#594363", outline="#876b92", width=2)
    img = art(svg, width - 26, height - 26)
    px = x + (width - img.width) // 2
    py = y + (height - img.height) // 2
    im.paste(img, (px, py), img)


def project_cards() -> list[tuple[str, str, Path]]:
    cards = re.findall(
        r'<a class="featured-project-card" data-gallery-category="[^"]+" '
        r'href="([^"]+\.html)">([\s\S]*?)</a>', DIRECTORY
    )
    output = []
    for href, markup in cards:
        slug = href[:-5]
        image = re.search(r'<img src="([^"]+\.(?:svg|jpe?g|png|webp))"', markup)
        title = re.search(r'<strong>([\s\S]*?)</strong>', markup)
        if not image or not title:
            raise ValueError(f"Incomplete thumbnail markup for {slug}")
        source = ROOT / "projects" / image.group(1)
        if not source.is_file():
            raise FileNotFoundError(source)
        text = html.unescape(re.sub(r"<[^>]+>", "", title.group(1)))
        output.append((slug, text, source))
    if len(output) != 16 or len({s for s, _, _ in output}) != 15:
        raise ValueError("Expected exactly 16 unique project thumbnails")
    return output


def write_project(slug: str, title: str, source: Path, number: int) -> None:
    im, d = base(f"Case Study {number:02d} / 16")
    d.text((57, 151), "PROJECT CASE STUDY", font=font(18, True), fill=TURQUOISE)
    y = draw_lines(d, title, 54, 202, 415, 51, PAPER, limit=4, spacing=13)
    d.text((54, min(y + 19, 459)), "Methods  ·  Results  ·  Evidence", 
           font=font(18), fill=MUTED)
    place_art(im, source, (493, 142, 1145, 508))
    im.save(DEST / f"{slug}.png", optimize=True)


def write_directory(cards: list[tuple[str, str, Path]]) -> None:
    im, d = base("16 Projects / Directory")
    draw_lines(d, "Engineering projects.", 52, 150, 485, 53, PAPER)
    d.text((54, 343), "Explore sixteen documented projects", font=font(21), fill=MUTED)
    d.text((54, 377), "across robotics, sensing, digital", font=font(21), fill=MUTED)
    d.text((54, 411), "systems and test automation.", font=font(21), fill=MUTED)
    for (slug, _, source), bounds in zip(
        [cards[0], cards[2], cards[8], cards[12]],
        [(618, 135, 868, 305), (879, 135, 1134, 305),
         (618, 320, 868, 501), (879, 320, 1134, 501)],
    ):
        place_art(im, source, bounds)
    im.save(DEST / "projects.png", optimize=True)


def write_workbench(cards: list[tuple[str, str, Path]]) -> None:
    im, d = base("Interactive Workbench")
    draw_lines(d, "The engineering workbench.", 52, 153, 515, 49, PAPER)
    d.text((54, 350), "Signals  /  Robot kinematics", font=font(21), fill=MUTED)
    d.text((54, 386), "Lighting  /  Thermal response", font=font(21), fill=MUTED)
    d.rounded_rectangle((627, 166, 1127, 466), radius=25,
                        fill="#302638", outline="#80628a", width=3)
    for i, (label, color) in enumerate([("OSC", PINK), ("ROBOT", TURQUOISE),
                                       ("DMX", "#f3c18c"), ("THERMAL", "#c4b9ec")]):
        x = 660 + (i % 2) * 235
        y = 194 + (i // 2) * 131
        d.rounded_rectangle((x, y, x + 207, y + 110), radius=14,
                            fill="#44344e", outline=color, width=3)
        d.text((x + 18, y + 31), label, font=font(27, True), fill=color)
    im.save(DEST / "workbench.png", optimize=True)


def write_portfolio(cards: list[tuple[str, str, Path]]) -> None:
    im, d = base("Engineering Portfolio")
    draw_lines(d, "Kailani Alarcon.", 53, 162, 480, 61, PAPER)
    draw_lines(d, "Robotics, embedded systems, and engineering verification.",
               54, 340, 510, 23, MUTED, bold=False, limit=3)
    place_art(im, cards[0][2], (630, 150, 1120, 488))
    im.save(DEST / "portfolio.png", optimize=True)


if __name__ == "__main__":
    cards = project_cards()
    for n, (slug, title, source) in enumerate(cards, 1):
        write_project(slug, title, source, n)
    write_directory(cards)
    write_workbench(cards)
    write_portfolio(cards)
    print("Generated", len(list(DEST.glob("*.png"))), "social previews in", DEST)
