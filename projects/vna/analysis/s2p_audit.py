#!/usr/bin/env python3
"""Offline Touchstone 1.0 two-port analyzer, created for portfolio recovery.

Supports S2P, RI/MA/DB, Hz/kHz/MHz/GHz, comments and wrapped records.
Does NOT perform VNA 12-term SOLT error correction or talk to RF hardware.
"""
from __future__ import annotations

import argparse
import cmath
import json
import math
from pathlib import Path
from typing import Any

UNITS = {"HZ": 1, "KHZ": 1e3, "MHZ": 1e6, "GHZ": 1e9}
FORMATS = {"RI", "MA", "DB"}


def _complex_pair(a: float, b: float, fmt: str) -> complex:
    if fmt == "RI":
        return complex(a, b)
    magnitude = a if fmt == "MA" else 10 ** (a / 20)
    return cmath.rect(magnitude, math.radians(b))


def diagnose_twoport(s11: complex, s21: complex, s12: complex, s22: complex) -> dict[str, Any]:
    """Synthetic-data algebraic checks, not passivity or reciprocity certification.

    With a common real positive port-reference impedance, the squared maximum
    singular value of S is the largest eigenvalue of S^H S. For an ideal
    linear passive two-port at a frequency this must be <= 1.
    """
    col1_power = abs(s11)**2 + abs(s21)**2
    col2_power = abs(s12)**2 + abs(s22)**2
    cross = s11.conjugate() * s12 + s21.conjugate() * s22
    discriminant = (col1_power - col2_power)**2 + 4 * abs(cross)**2
    maximum_gain = (col1_power + col2_power + math.sqrt(max(0.0, discriminant))) / 2
    reciprocity_error = abs(s21 - s12)
    return {
        "maximum_power_gain": maximum_gain,
        "passivity_compatible": maximum_gain <= 1 + 1e-9,
        "reciprocity_difference_abs": reciprocity_error,
    }


def read_s2p(path: Path) -> dict[str, Any]:
    """Read Touchstone 1.0 S2P with S11, S21, S12, S22 port order."""
    tokens: list[float] = []
    unit, fmt, z0 = "GHZ", "MA", 50.0
    for lineno, original in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        line = original.split("!", 1)[0].strip()
        if not line:
            continue
        if line.startswith("["):
            raise ValueError(f"line {lineno}: Touchstone 2.0 directives not supported")
        if line.startswith("#"):
            fields = line[1:].upper().split()
            if len(fields) < 3 or fields[1] != "S":
                raise ValueError(f"line {lineno}: only S-parameters supported")
            unit, fmt = fields[0], fields[2]
            if unit not in UNITS or fmt not in FORMATS:
                raise ValueError(f"line {lineno}: unsupported format/unit")
            if "R" in fields:
                ri = fields.index("R")
                if ri + 1 >= len(fields):
                    raise ValueError(f"line {lineno}: missing impedance")
                z0 = float(fields[ri + 1])
            continue
        try:
            parsed = [float(word.replace("D", "E").replace("d", "e")) for word in line.split()]
        except ValueError as exc:
            raise ValueError(f"line {lineno}: nonnumeric data") from exc
        tokens.extend(parsed)
    if not tokens or len(tokens) % 9:
        raise ValueError("Expected nine numeric values per two-port record")
    if not (math.isfinite(z0) and z0 > 0):
        raise ValueError("Reference impedance must be positive and finite")
    if not all(math.isfinite(x) for x in tokens):
        raise ValueError("S2P data contains nonfinite numbers")
    records: list[dict[str, Any]] = []
    last_freq = 0.0
    for i in range(0, len(tokens), 9):
        vals = tokens[i:i+9]
        hz = vals[0] * UNITS[unit]
        if hz <= last_freq:
            raise ValueError("Frequencies must be positive and strictly increasing")
        last_freq = hz
        # The Touchstone 1.0 two-port order is S11, S21, S12, S22.
        s11, s21, s12, s22 = [_complex_pair(vals[j], vals[j+1], fmt) for j in (1, 3, 5, 7)]
        g = abs(s11)
        vswr = (1+g)/(1-g) if g < 1 else None  # undefined for |Gamma| >= 1
        zin = z0 * (1+s11)/(1-s11) if abs(1-s11) > 1e-12 else None
        def db(value: complex) -> float | None:
            return 20 * math.log10(abs(value)) if abs(value) > 0 else None
        records.append({
            "frequency_Hz": hz,
            "S11_dB": db(s11), "S21_dB": db(s21),
            "S12_dB": db(s12), "S22_dB": db(s22),
            "return_loss_dB": (-db(s11) if db(s11) is not None else None),
            "VSWR": vswr,
            "input_impedance_ohms": ({"real": zin.real, "imag": zin.imag} if zin is not None else None),
            "S11_complex": {"real": s11.real, "imag": s11.imag},
            "S21_complex": {"real": s21.real, "imag": s21.imag},
            "diagnostics": diagnose_twoport(s11, s21, s12, s22),
        })
    return {"filename": path.name, "reference_impedance_ohms": z0, "format": fmt,
            "frequency_unit": unit, "number_of_points": len(records),
            "calibration_verified": False, "measurements": records,
            "warning": "Two-port diagnostics are algebraic checks for a common real positive reference impedance, not instrument calibration, actual DUT passivity, reciprocity, or data provenance."}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_file", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    obj = read_s2p(args.input_file)
    result = json.dumps(obj, indent=2, allow_nan=False) + "\n"
    if args.output:
        args.output.write_text(result, encoding="utf-8")
        print(f"Wrote {args.output}")
    else:
        print(result, end="")


if __name__ == "__main__":
    main()
