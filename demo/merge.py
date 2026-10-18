"""
Joins the recorded video with the voice-over: each audio/<scene>.mp3 starts exactly when its scene starts.
Writes demo/research-map-demo.mp4 (H.264 + AAC, plays everywhere).
Run: python demo/merge.py
"""
import json
import pathlib
import subprocess
import sys

DEMO = pathlib.Path(__file__).resolve().parent
TOOLS = DEMO / "tools" / "node_modules"
FFMPEG = TOOLS / "ffmpeg-static" / "ffmpeg.exe"
FFPROBE = TOOLS / "ffprobe-static" / "bin" / "win32" / "x64" / "ffprobe.exe"
VIDEO = DEMO / "video" / "raw.webm"
OUT = DEMO / "research-map-demo.mp4"
LIMIT = 180.0  # the contest allows at most 3 minutes

at = json.loads((DEMO / "video" / "timeline.json").read_text(encoding="utf-8"))["at"]
clips = [(scene, DEMO / "audio" / f"{scene}.mp3") for scene in at]
missing = [str(path) for _, path in clips if not path.exists()]
if missing:
    sys.exit("Missing voice files:\n  " + "\n  ".join(missing))

length = float(subprocess.run([str(FFPROBE), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(VIDEO)],
                              capture_output=True, text=True).stdout)
args = [str(FFMPEG), "-y", "-i", str(VIDEO)]
for _, path in clips:
    args += ["-i", str(path)]
# Delay each clip to its scene start, then mix them into one track.
delays = [f"[{i + 1}:a]adelay={at[scene]}|{at[scene]}[a{i}]" for i, (scene, _) in enumerate(clips)]
mix = "".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0[voice]"
args += ["-filter_complex", ";".join(delays + [mix]), "-map", "0:v", "-map", "[voice]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
         "-t", str(min(length, LIMIT)), "-movflags", "+faststart", str(OUT)]
subprocess.run(args, check=True)
print(f"Done: {OUT} ({min(length, LIMIT):.1f} s)")
