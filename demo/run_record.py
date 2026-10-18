"""
Records the demo: writes record.js, runs it with the Playwright CLI and saves when each scene starts (video/timeline.json).
The recording browser must already be open and signed in (playwright-cli open http://localhost:3000/login).
Run: python demo/run_record.py
"""
import json
import pathlib
import re
import subprocess
import sys

DEMO = pathlib.Path(__file__).resolve().parent

subprocess.run([sys.executable, str(DEMO / "make_record.py")], check=True)
out = subprocess.run("playwright-cli run-code --filename demo/record.js", cwd=DEMO.parent, shell=True,
                     capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
match = re.search(r"### Result\s*\n(.+)", out)
if not match:
    sys.exit("Recording failed:\n" + out[-3000:])
result = json.loads(match.group(1))
result = json.loads(result) if isinstance(result, str) else result
(DEMO / "video" / "timeline.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print("Recorded. Scene start times saved to demo/video/timeline.json")
for scene, ms in result["took"].items():
    print(f"  {scene:15} starts at {result['at'][scene] / 1000:6.1f}s, actions took {ms / 1000:5.1f}s")
