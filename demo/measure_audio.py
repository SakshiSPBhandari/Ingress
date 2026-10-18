"""
Prepares the voice clips in demo/audio for the video.
Clips named after their scene (s01_problem.mp3 ...) are used as they are. Otherwise the 12 MP3 files are taken
in the order they were downloaded and renamed to the scene names. Then each clip's length is saved to durations.json.
Run: python demo/measure_audio.py
"""
import json
import pathlib
import subprocess
import sys

DEMO = pathlib.Path(__file__).resolve().parent
AUDIO = DEMO / "audio"
FFPROBE = DEMO / "tools" / "node_modules" / "ffprobe-static" / "bin" / "win32" / "x64" / "ffprobe.exe"
scenes = json.loads((DEMO / "narration.json").read_text(encoding="utf-8"))
ids = [s["id"] for s in scenes]

if not all((AUDIO / f"{i}.mp3").exists() for i in ids):
    files = sorted((p for p in AUDIO.glob("*.mp3") if p.stem not in ids), key=lambda p: p.stat().st_mtime)
    if len(files) != len(ids):
        sys.exit(f"Found {len(files)} new MP3 files in demo/audio, expected {len(ids)} (one per scene, in order).")
    for scene_id, path in zip(ids, files):
        print(f"  {path.name}  ->  {scene_id}.mp3")
        path.rename(AUDIO / f"{scene_id}.mp3")


def length(path):
    out = subprocess.run([str(FFPROBE), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True).stdout
    return round(float(out), 2)


durations = {}
for scene in scenes:
    seconds = length(AUDIO / f"{scene['id']}.mp3")
    durations[scene["id"]] = seconds
    expected = len(scene["text"].split()) / 2.4
    note = "  <- check this clip: its length does not fit its text" if not 0.6 < seconds / expected < 1.6 else ""
    print(f"  {scene['id']:15} {seconds:6.1f}s{note}")
(AUDIO / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
total = sum(durations.values())
print(f"Total voice: {total:.1f}s" + ("  (over 168s: the video would pass 3 minutes)" if total > 168 else ""))
