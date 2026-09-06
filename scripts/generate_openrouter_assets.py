#!/usr/bin/env python3
"""Generate curated V3 development assets through OpenRouter's image API.

The API key is read from OPENROUTER_API_KEY when available, otherwise requested
through a no-echo terminal prompt, and is never written to disk. Generated image
bytes are saved under public/art/.
"""

from __future__ import annotations

import argparse
import base64
import getpass
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "art"
API_URL = "https://openrouter.ai/api/v1/images"


ART_DIRECTION = """
Tactile editorial romance under pressure from an overconfident clinical system.
Contemporary high-end still-life photography with archival handling marks, fine
film grain, soft directional window or table-lamp light, deep natural falloff,
warm cotton-rag paper, graphite and oxblood ink, pressed bruised red flowers,
brushed dark metal, physically plausible shadows, and subtle art-department
surrealism. Deep oxblood/carmine rather than candy red. Avoid Valentine's Day,
wedding, neon, glossy 3D, stock romance, legible song lyrics, logos, and watermarks.
""".strip()


PROMPTS = {
    "motif": f"""
{ART_DIRECTION}

Create one isolated recurring romantic motif for avoid.love that can travel across
multiple web scenes as a foreground object. A genuinely photographic pressed deep
red flower, a small folded warm-ivory note with only illegible graphite marks, one
loose petal, and a thin oxblood-red thread that curls through the cluster. Keep the
objects compact in the center-right of a wide 16:9 canvas with generous empty space
around them. The cluster should feel handled, fragile, intimate, and physically real,
with subtle paper creases and natural shadows. Transparent background / alpha if the
image model supports it; otherwise use a perfectly even warm neutral paper field that
is easy to blend or mask. No readable text, no machinery, no Valentine's symbols,
no hearts, no people, no watermark.
""".strip(),
    "motif-key": f"""
{ART_DIRECTION}

Create a clean isolated cutout asset of the recurring avoid.love romantic objects:
one genuinely photographic pressed deep-red flower, a small folded warm-ivory note
with only illegible graphite marks, one loose petal, and a thin oxblood-red thread
curling through the cluster. Keep the cluster centered with nothing touching the
frame. IMPORTANT: photograph the objects on one perfectly flat, uniform chroma-key
green background (#00FF00), with no texture, gradient, vignette, table, border, or
other scenery. Keep object edges crisp and keep cast shadows very tight to the
objects so the green can be removed cleanly. No readable text, no machinery, no
hearts, no people, no watermark.
""".strip(),
    "unsent": f"""
{ART_DIRECTION}

Create a wide cinematic late-night still life for the UNSENT chapter of avoid.love.
A warm desk in an otherwise dark room holds several crumpled and rewritten ivory
message drafts with deliberately illegible handwriting, a fountain pen, one cooling
coffee cup, the same bruised pressed red flower, one loose petal, and the oxblood
thread slipping between papers. A phone lies face-down near the edge with no visible
screen or interface. The composition should feel like five private minutes spent
rewriting something you were afraid to send: intimate, lonely, restrained, and very
romantic without becoming sentimental. Keep the left third and upper left relatively
dark and quiet for oversized typography; cluster the tactile evidence toward center
and right. Warm amber practical light against deep brown-black falloff, photographic
realism, shallow depth, film grain. No readable text, no people, no hearts, no logos,
no watermark.
""".strip(),
    "hero": f"""
{ART_DIRECTION}

Create a wide cinematic hero still life for avoid.love. On the right half of the
frame, a folded handwritten ivory letter, one pressed red flower, and a single
oxblood thread are physically constrained beneath a precision measuring rail and
two mechanical clamps as though a bureaucratic machine is trying to keep love
apart. The left half should remain calmer and lighter for oversized black editorial
typography. Use layered foreground occlusion, shallow but believable depth, a dark
charcoal-to-warm-paper environment, and a composition that can be cropped for web
parallax. No people and no readable text.
""".strip(),
    "archive": f"""
{ART_DIRECTION}

Create a top-down editorial evidence archive of an implied relationship on a warm
ivory desk: a cafe receipt with unreadable marks, pressed flower, worn train or
cinema ticket, folded handwritten note with no readable text, photo-booth strip
showing only blurred silhouettes/cropped shoulders, coffee sleeve, circled date,
and the same oxblood red thread weaving between objects. The arrangement should
feel intimate and genuinely kept, while thin measuring rulers and classification
marks intrude from the edges. Strong composition, depth from paper overlaps, soft
window light, imperfect human handling, no kitschy Valentine's imagery.
""".strip(),
    "distance": f"""
{ART_DIRECTION}

Create a cinematic nocturnal distance scene seen through a rain-streaked train or
car window. Two empty seats or two cups are separated across the frame, city lights
blur outside, and a single oxblood thread stretches almost to breaking between the
two sides. Include one tiny dried petal near the foreground and a folded note edge
barely visible. Moody blue-black exterior, warm amber practical light inside,
melancholic negative space, no people, no readable text, photographic realism.
""".strip(),
    "protocol": f"""
{ART_DIRECTION}

Create a wide surreal physical anti-love containment apparatus built by an art
department rather than a fantasy renderer. A large brushed-metal machine uses
clamps, rollers, measurement gauges, archive slots, and a paper shredder-like mouth
to process the same folded ivory letter, pressed red flower, photo strip, and red
thread. The romantic objects visibly resist the mechanism; one petal escapes.
Mechanical precision versus tactile human fragility. Dark charcoal environment,
oxblood accents, directional industrial light softened by warm paper reflections,
no cyberpunk UI, no screens full of data, no people, no readable text.
""".strip(),
    "reveal": f"""
{ART_DIRECTION}

Create a warm cinematic final still life after the machine has given up. The same
folded letter is now open but contains only suggestive illegible handwriting, the
pressed red flower is whole again, the oxblood thread lies relaxed and connected,
two coffee cups sit close together, and scattered keepsakes from earlier scenes
rest freely in warm amber light. No mechanical clamps remain; only faint abandoned
measurement marks at the edge. Intimate warm ivory, rose, deep red, and soft shadow;
quiet emotional release, no people, no readable text, no wedding or Valentine look.
""".strip(),
}


def generate(key: str, model: str, prompt: str, output_name: str) -> Path:
    payload = {
        "model": model,
        "prompt": prompt,
        "aspect_ratio": "16:9",
        "n": 1,
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            data = json.load(response)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenRouter returned HTTP {exc.code}: {body[:600]}") from exc

    items = data.get("data") or []
    if not items or not items[0].get("b64_json"):
        raise RuntimeError(f"Image response did not contain b64_json: {json.dumps(data)[:800]}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / output_name
    path.write_bytes(base64.b64decode(items[0]["b64_json"]))
    return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("job", choices=[*sorted(PROMPTS), "suite"])
    parser.add_argument("--model", default="google/gemini-3.1-flash-image")
    parser.add_argument("--output")
    args = parser.parse_args()

    key = os.environ.get("OPENROUTER_API_KEY") or getpass.getpass("OpenRouter API key: ")
    if not key:
        print("No API key supplied.", file=sys.stderr)
        return 2

    jobs = [args.job] if args.job != "suite" else ["archive", "distance", "protocol", "reveal"]
    try:
        for job in jobs:
            output = args.output if len(jobs) == 1 and args.output else f"{job}-{args.model.split('/')[-1]}.png"
            path = generate(key, args.model, PROMPTS[job], output)
            print(path.relative_to(ROOT))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
