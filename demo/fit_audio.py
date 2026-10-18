"""
Makes the voice clips fit the 3-minute limit without changing a word.
1. Removes silence at the start and end of each clip and shortens long pauses inside it to 0.3 s.
2. If the clips are still too long, speeds all of them up by the same small amount (the pitch stays the same).
The original clips are kept in demo/audio/original. Then run measure_audio.py, run_record.py and merge.py.
Run: python demo/fit_audio.py
"""
import pathlib
import shutil
import subprocess
import sys

DEMO = pathlib.Path(__file__).resolve().parent
AUDIO = DEMO / "audio"
ORIGINAL = AUDIO / "original"
TOOLS = DEMO / "tools" / "node_modules"
FFMPEG = TOOLS / "ffmpeg-static" / "ffmpeg.exe"
FFPROBE = TOOLS / "ffprobe-static" / "bin" / "win32" / "x64" / "ffprobe.exe"
TARGET = 166.0  # seconds of voice; the rest of the 3 minutes is room between scenes
MAX_SPEED = 1.25  # faster than this sounds rushed

clips = sorted(AUDIO.glob("s[0-9][0-9]_*.mp3"))
if not clips:
    sys.exit("No scene clips in demo/audio. Run measure_audio.py first.")
ORIGINAL.mkdir(exist_ok=True)
for clip in clips:
    if not (ORIGINAL / clip.name).exists():
        shutil.copy2(clip, ORIGINAL / clip.name)


def length(path):
    out = subprocess.run([str(FFPROBE), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True).stdout
    return float(out)


def render(src, dst, speed):
    # Trim the start, shorten every pause longer than 0.45 s to 0.3 s, trim the end, then change the tempo.
    trim = ("silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.05,"
            "silenceremove=stop_periods=-1:stop_duration=0.45:stop_threshold=-40dB:stop_silence=0.3")
    tempo = f",atempo={speed:.3f}" if speed > 1.001 else ""
    subprocess.run([str(FFMPEG), "-v", "error", "-y", "-i", str(src), "-af", trim + tempo,
                    "-c:a", "libmp3lame", "-b:a", "192k", str(dst)], check=True)


work = AUDIO / "_trimmed"
work.mkdir(exist_ok=True)
for clip in clips:
    render(ORIGINAL / clip.name, work / clip.name, 1.0)
trimmed = sum(length(work / c.name) for c in clips)
original = sum(length(ORIGINAL / c.name) for c in clips)
speed = min(MAX_SPEED, max(1.0, trimmed / TARGET))
for clip in clips:
    render(ORIGINAL / clip.name, clip, speed)
shutil.rmtree(work)
final = sum(length(c) for c in clips)
print(f"Original {original:.1f}s -> pauses shortened {trimmed:.1f}s -> speed x{speed:.2f} -> {final:.1f}s")
if final > TARGET + 2:
    print("Still too long even at the maximum speed: some clips need shorter text.")
