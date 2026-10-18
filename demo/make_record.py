"""
Writes demo/record.js: the Playwright script that records the product demo.
Each scene lasts as long as its narration: the real voice length from audio/durations.json when it exists,
otherwise an estimate from the number of words.
Run: python demo/make_record.py   then   playwright-cli run-code --filename demo/record.js
"""
import json
import pathlib
import re

DEMO = pathlib.Path(__file__).resolve().parent
ROOT = DEMO.parent

narration = json.loads((DEMO / "narration.json").read_text(encoding="utf-8"))
ids = json.loads((DEMO / "ids.json").read_text(encoding="utf-8"))
durations_file = DEMO / "audio" / "durations.json"
real = json.loads(durations_file.read_text(encoding="utf-8")) if durations_file.exists() else {}

# Milliseconds per scene, plus a short pause so sentences do not run into each other.
timing = {}
for scene in narration:
    seconds = real.get(scene["id"]) or len(scene["text"].split()) / 2.4
    timing[scene["id"]] = round((seconds + 0.35) * 1000)

# The real warning card of the extension, so the video shows exactly what users see.
source = (ROOT / "extension" / "background.js").read_text(encoding="utf-8")
card = re.search(r"function showGoalWarning\(goal, reason, canMark\) \{.*?\n\}\n", source, re.S).group(0)

script = (DEMO / "record.template.js").read_text(encoding="utf-8")
script = (script.replace("__TIMING__", json.dumps(timing, indent=2))
                .replace("__IDS__", json.dumps(ids))
                .replace("__VIDEO__", json.dumps(str(DEMO / "video" / "raw.webm")))
                .replace("__CARD__", card))
(DEMO / "video").mkdir(exist_ok=True)
(DEMO / "record.js").write_text(script, encoding="utf-8")
total = sum(timing.values()) / 1000
print(f"record.js written. {len(timing)} scenes, {total:.0f} s in total ({'real voice lengths' if real else 'estimated'}).")
