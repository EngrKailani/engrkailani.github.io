"""Redact public NASA engineering figures from the two published portfolio PDFs.

Keeps other career information, academic dates, and engineering results unchanged.
Uses secure PDF redactions, not white rectangles covering the original characters.
"""
import os
import re
import unicodedata
from pathlib import Path
import fitz

FILES = {
    "assets/Kailani_Alarcon_CV.pdf": {
        "expected": 6,
        "rules": [
            ("Human Factors Engineering and Mechanical Design;",
             "Human Factors Engineering and Mechanical Design; Test Engineering  |  Huntsville, Alabama"),
            ("hierarchical system requirements from",
             "•  Independently developed hierarchical requirements from operating scenarios, covering"),
            ("Independently assessed a legacy arm",
             "•  Independently assessed a legacy arm’s workspace, joint loading, and actuator compatibility; evaluated"),
            ("preliminary shoulder self-load moment",
             "preliminary shoulder loads while accounting for limitations in component-mass estimates."),
            ("cleaning routines; authored",
             "cleaning routines; authored technical specifications for design and verification."),
            ("Quantified surface coverage",
             "•  Quantified surface coverage, optical darkening, particle morphology, and spatial variability using"),
        ],
    },
    "assets/Kailani_Alarcon_Master_Resume.pdf": {
        "expected": 9,
        "rules": [
            ("Human Factors Engineering & Mechanical Design;",
             "Human Factors Engineering & Mechanical Design; test engineering projects | Huntsville, AL"),
            ("longitudinal sectioning and sub-window sampling",
             "•  Performed longitudinal sectioning and sub-window sampling with statistical confidence intervals to assess spatial"),
            ("ceiling-mounted",
             "•  Contributed to the concept and design planning of a ceiling-mounted robotic arm for automated tool manipulation"),
            ("hierarchical system requirements from",
             "•  Developed hierarchical system requirements from operating scenarios and assessed preliminary shoulder loading"),
            ("moment for a horizontal legacy-arm configuration",
             "for a legacy-arm configuration, noting that some component masses were omitted from the calculation."),
            ("technical specification set addressing",
             "•  Authored technical specifications addressing assembly, budgets, electrical, safety/FMEA, sensors, software,"),
            ("NASA MSFC EV73 |", None),
            ("Instron Wire Pull Test Data Processor |",
             "Instron Wire Pull Test Data Processor | Excel/VBA"),
        ],
    },
}
FONT_ROOT = Path("/usr/share/fonts/truetype/croscore")

def norm(text):
    return unicodedata.normalize("NFKC", text).replace("\u00ad", "-")

def update_pdf(path, settings):
    pdf = fitz.open(path)
    if len(pdf) != 3:
        raise ValueError("Unexpected number of PDF pages: " + str(path))
    changes = []
    for page in pdf:
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                current = "".join(span["text"] for span in line["spans"]).strip()
                for marker, replacement in settings["rules"]:
                    if marker not in current:
                        continue
                    if marker == "NASA MSFC EV73 |":
                        replacement = current.replace(marker, "NASA Marshall |")
                    if len(line["spans"]) != 1:
                        raise ValueError("Unexpected mixed font line")
                    span = line["spans"][0]
                    style = "Bold" if "Bold" in span["font"] else "Italic" if "Italic" in span["font"] else "Regular"
                    fontfile = FONT_ROOT / ("Tinos-" + style + ".ttf")
                    font = fitz.Font(fontfile=str(fontfile))
                    width = font.text_length(replacement, fontsize=span["size"])
                    available = page.rect.width - span["origin"][0] - 35
                    if width > available:
                        raise ValueError("Line replacement does not fit page")
                    changes.append((page.number, span, current, replacement, style, str(fontfile)))
                    break
    if len(changes) != settings["expected"]:
        raise ValueError(f"Unexpected match count: {len(changes)}")
    for page_number, span, before, after, style, fontfile in changes:
        rect = fitz.Rect(span["bbox"]) + (-.2, -.05, .2, .05)
        pdf[page_number].add_redact_annot(rect, fill=(1, 1, 1), cross_out=False)
    for page in pdf:
        page.apply_redactions(images=0, graphics=0, text=0)
    for page_number, span, before, after, style, fontfile in changes:
        color = span["color"]
        rgb = ((color >> 16 & 255) / 255, (color >> 8 & 255) / 255, (color & 255) / 255)
        page = pdf[page_number]
        alias = "PUBLIC_Tinos_" + style
        page.insert_font(fontname=alias, fontfile=fontfile)
        page.insert_text(span["origin"], after, fontname=alias,
                         fontsize=span["size"], color=rgb, overlay=True)
    updated = path.with_suffix(".public-updated.pdf")
    pdf.save(str(updated), garbage=4, deflate=True)
    pdf.close()
    verify = fitz.open(updated)
    entire = "\n".join(page.get_text() for page in verify)
    checks = [r"(?i)\b34\s+hierarchical", r"(?i)\b3\.1\s*N", r"(?i)\b12[- ]document",
              r"(?i)authored\s+12\s+technical", r"(?i)\b95%", r"(?i)\bsix.axis\s+robot",
              r"(?i)\bEV73\b", r"(?i)\bv3\.4\b"]
    if any(re.search(pattern, entire) for pattern in checks):
        raise ValueError("Public NASA measurement or version still present")
    for page_number, span, before, after, style, fontfile in changes:
        visible = norm(verify[page_number].get_text())
        if norm(after) not in visible or norm(before) in visible:
            raise ValueError("Edited PDF text did not validate")
    verify.close()
    os.replace(updated, path)
    print("Validated " + str(path) + ": 3 pages, " + str(len(changes)) + " replacements")

if __name__ == "__main__":
    for filename, settings in FILES.items():
        update_pdf(Path(filename), settings)
