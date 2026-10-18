// Records the Research Map demo. Generated into record.js by make_record.py (timings and ids are filled in there).
async (page) => {
  const T = {
  "s01_problem": 16810,
  "s02_solution": 14940,
  "s03_goal": 14460,
  "s04_start": 13740,
  "s05_canvas": 16980,
  "s06_details": 13450,
  "s07_warning": 15370,
  "s08_goal_time": 11530,
  "s09_report": 9780,
  "s10_share": 10260,
  "s11_more": 16980,
  "s12_close": 13190
};
  const IDS = {"workspace": "a2ae0d8b-63c5-49f3-b534-de0a28fb72d6", "session": "9ece479f-a766-42fe-9ebd-3f6f1c341ed7", "goal": "Learn the basics of Kubernetes for my DevOps exam", "reason": "The page is about the FIFA World Cup, which is unrelated to learning Kubernetes basics."};
  const APP = "http://localhost:3000";
  const W = IDS.workspace;

  /* ---------------------------------------------------------------- helpers */
  const wait = (ms) => page.waitForTimeout(ms);
  let started = 0;
  const took = {}; // how long each scene's actions took, in ms, so the script can be tuned to the voice
  let videoStart = 0;
  const at = {}; // when each scene starts in the video, in ms, so each voice clip can be placed exactly
  const scene = () => { started = Date.now(); };
  // Waits until the scene has lasted as long as its narration.
  const endScene = async (id) => {
    took[id] = Date.now() - started;
    at[id] = started - videoStart;
    const left = T[id] - took[id];
    if (left > 0) await wait(left);
  };
  // Smoothly zooms the whole page toward an element, like a camera moving in.
  const zoomTo = async (locator, scale = 1.45) => {
    const box = await locator.boundingBox({ timeout: 4000 }).catch(() => null); // never let a missing element stall the video
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.evaluate(([x, y, s]) => {
      const el = document.documentElement;
      el.style.transition = "transform 0.9s cubic-bezier(.2,.8,.2,1)";
      el.style.transformOrigin = `${x + window.scrollX}px ${y + window.scrollY}px`;
      el.style.transform = `scale(${s})`;
    }, [x, y, scale]);
    await wait(950);
  };
  const zoomOut = async () => {
    await page.evaluate(() => { document.documentElement.style.transform = "none"; });
    await wait(900);
  };
  const scrollTo = async (locator) => {
    await locator.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
    await wait(1100);
  };
  // The app keeps a live connection open, so the network is never idle: wait for the page itself instead.
  const open = async (path) => {
    await page.goto(APP + path, { waitUntil: "domcontentloaded" });
    await wait(1500);
  };
  // The app remembers an open side panel, so close it before showing the canvas.
  const closePanel = async () => {
    const close = page.getByRole("button", { name: "Close panel" });
    if (await close.isVisible().catch(() => false)) await close.click();
  };
  const node = (title) => page.locator(".react-flow__node", { hasText: title }).first();

  /* ---------------------------------------------------------------- recording */
  await page.setViewportSize({ width: 1280, height: 800 });
  await open("/");
  await page.screencast.stop().catch(() => {}); // a run that failed earlier may still be recording
  await page.screencast.start({ path: "C:\\Users\\Sakshi\\Desktop\\MyAllProjects\\3-idiots\\demo\\video\\raw.webm", size: { width: 1280, height: 800 }, fps: 30 });
  videoStart = Date.now();
  await page.screencast.showActions({
    duration: 700,
    style: {
      point: "width: 22px; height: 22px; border-radius: 50%; background: rgba(238, 112, 72, .55); box-shadow: 0 0 0 6px rgba(238, 112, 72, .18)",
      title: "display: none",
    },
  });

  // 1. The problem
  scene();
  await wait(4500);
  await scrollTo(page.getByText("Too many tabs? We fix this."));
  await wait(1200);
  await zoomTo(page.getByText("The problem").locator(".."), 1.55);
  await endScene("s01_problem");

  // 2. The solution
  scene();
  await zoomOut();
  await zoomTo(page.getByText("With Research Map").locator(".."), 1.55);
  await wait(3500);
  await zoomOut();
  await scrollTo(page.getByRole("heading", { name: "How it works" }));
  await endScene("s02_solution");

  // 3. A new workspace and the goal question
  scene();
  await open("/workspaces");
  await page.getByRole("button", { name: "New workspace" }).first().click();
  await page.getByPlaceholder("e.g. DevOps exam").pressSequentially("Kubernetes basics", { delay: 45 });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  const goalDialog = page.getByRole("dialog");
  await goalDialog.waitFor();
  await wait(600);
  await zoomTo(goalDialog, 1.3);
  await page.getByRole("switch", { name: "Yes, I have a goal" }).click();
  await wait(500);
  await page.locator("#session-goal").pressSequentially("Learn the basics of Kubernetes", { delay: 38 });
  await wait(900);
  await zoomOut();
  await page.getByRole("button", { name: "Continue" }).click();
  await endScene("s03_goal");

  // 4. The arrow and Start Tracking
  scene();
  const start = page.getByRole("button", { name: "Start tracking" });
  await wait(600);
  await zoomTo(start, 1.9);
  await wait(2200);
  await start.click();
  await wait(1200);
  await zoomOut();
  await endScene("s04_start");

  // 5. The canvas: pages in a tree
  scene();
  await open(`/w/${W}`);
  await closePanel();
  await page.getByRole("button", { name: "Show everything" }).click().catch(() => {});
  await wait(2500);
  await zoomTo(node("Kubernetes Documentation"), 1.6);
  await wait(3500);
  await zoomOut();
  await zoomTo(node("Concepts"), 1.6);
  await wait(3500);
  await zoomOut();
  await endScene("s05_canvas");

  // 6. Page details written by Gemini
  scene();
  await node("Service").click();
  const panel = page.locator("aside").filter({ hasText: "Summary" }).first();
  await panel.waitFor();
  await wait(1200);
  await zoomTo(panel.getByText("Summary").locator(".."), 1.5);
  await wait(2500);
  await zoomOut();
  await scrollTo(panel.getByText("Key points"));
  await zoomTo(panel.getByText("Key points").locator(".."), 1.5);
  await endScene("s06_details");
  await zoomOut();
  await page.getByRole("button", { name: "Close panel" }).click().catch(() => {});

  // 7. The goal warning on a page that is not part of the goal (the extension's own card)
  scene();
  await page.goto("https://en.wikipedia.org/wiki/FIFA_World_Cup");
  await page.waitForLoadState("domcontentloaded");
  await wait(2500);
  await page.evaluate(([goal, reason]) => {
    globalThis.chrome = globalThis.chrome || { runtime: { sendMessage() {} } };
    function showGoalWarning(goal, reason, canMark) {
  document.getElementById("research-map-goal-warning")?.remove();
  const host = document.createElement("div");
  host.id = "research-map-goal-warning";
  host.style.cssText = "all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;";
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `<style>
    .card{box-sizing:border-box;width:350px;max-width:calc(100vw - 32px);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#12151c;
      background:#fff;border-radius:24px;box-shadow:0 2px 6px rgba(18,21,28,.08),0 24px 48px -16px rgba(18,21,28,.35);padding:18px;animation:in .22s ease-out}
    @keyframes in{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
    .top{display:flex;align-items:center;gap:12px}
    .icon{flex:none;width:40px;height:40px;border-radius:14px;background:#ee7048;display:grid;place-items:center}
    h2{margin:0;flex:1;font-size:15px;font-weight:700;line-height:1.3}
    .x{flex:none;width:28px;height:28px;border:0;border-radius:50%;background:#f5f3f0;font-size:18px;line-height:1;cursor:pointer;color:#666b75}
    .x:hover{background:#e6e2dc}
    .label{margin:14px 0 2px;font-size:12px;font-weight:600;color:#666b75}
    .goal{margin:0;font-weight:600}
    .reason{margin:8px 0 0;color:#2d323c}
    .row{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
    button.b{flex:1;min-width:120px;border:0;border-radius:999px;padding:10px 14px;font:600 13px system-ui,sans-serif;cursor:pointer;transition:transform .15s}
    button.b:hover{transform:translateY(-1px)}
    .primary{background:#12151c;color:#fff}.secondary{background:#f5f3f0;color:#12151c}
  </style>
  <div class="card" role="alertdialog" aria-labelledby="t">
    <div class="top">
      <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg></span>
      <h2 id="t">This page is not part of your goal</h2>
      <button class="x" aria-label="Close">×</button>
    </div>
    <p class="label">Your goal</p><p class="goal"></p><p class="reason"></p>
    <div class="row"><button class="b primary" data-a="back">Go back</button><button class="b secondary" data-a="related">This page is related</button></div>
  </div>`;
  root.querySelector(".goal").textContent = goal;
  if (!canMark) root.querySelector("[data-a=related]").remove();
  if (reason) root.querySelector(".reason").textContent = reason;
  else root.querySelector(".reason").remove();
  const onKey = (e) => { if (e.key === "Escape") close(); };
  const close = () => { host.remove(); document.removeEventListener("keydown", onKey, true); };
  document.addEventListener("keydown", onKey, true);
  root.querySelector(".x").onclick = close;
  root.querySelectorAll("button.b").forEach((b) => (b.onclick = () => {
    chrome.runtime.sendMessage({ type: b.dataset.a === "back" ? "GOAL_LEAVE" : "GOAL_MARK_RELATED", title: document.title });
    close();
  }));
  (document.body || document.documentElement).appendChild(host);
}

    showGoalWarning(goal, reason, true);
  }, [IDS.goal, IDS.reason]);
  await wait(1500);
  await zoomTo(page.locator("#research-map-goal-warning"), 1.25);
  await page.mouse.move(1050, 120);
  await endScene("s07_warning");
  await zoomOut();

  // 8. The tag on the canvas and the time on the goal
  scene();
  await open(`/w/${W}`);
  await closePanel();
  await page.getByRole("button", { name: "Show everything" }).click().catch(() => {});
  await wait(1500);
  await zoomTo(node("FIFA World Cup"), 1.8);
  await wait(1400);
  await zoomOut();
  await page.getByRole("button", { name: "Your goal. Show details" }).click({ timeout: 6000 }).catch(() => {});
  await page.locator("[data-radix-popper-content-wrapper]").first().waitFor({ timeout: 4000 }).catch(() => {});
  await wait(600);
  await zoomTo(page.locator("[data-radix-popper-content-wrapper]").first(), 1.6);
  await endScene("s08_goal_time");
  await zoomOut();
  await page.keyboard.press("Escape");

  // 9. The session report
  scene();
  await open(`/w/${W}/report/${IDS.session}`);
  await scrollTo(page.getByText("Where your time went"));
  await zoomTo(page.getByText("Where your time went").locator(".."), 1.3);
  await wait(1300);
  await zoomOut();
  await scrollTo(page.getByRole("heading", { name: "Summary" }));
  await zoomTo(page.getByRole("heading", { name: "Summary" }).locator("../.."), 1.3);
  await endScene("s09_report");
  await zoomOut();

  // 10. Sharing
  scene();
  await open(`/w/${W}`);
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await wait(1200);
  await page.getByRole("button", { name: "Create and copy link" }).click();
  await wait(1500);
  await zoomTo(page.getByText("Links that work now").locator(".."), 1.45);
  await endScene("s10_share");
  await zoomOut();
  await page.keyboard.press("Escape");

  // 11. More features: list and timeline views, export, Conflict Radar, AI assistants (MCP)
  scene();
  const header = page.locator("header").first();
  await header.getByText("List", { exact: true }).click({ timeout: 6000 }).catch(() => {});
  await wait(1000);
  await header.getByText("Timeline", { exact: true }).click({ timeout: 6000 }).catch(() => {});
  await wait(1000);
  await header.getByText("Canvas", { exact: true }).click({ timeout: 6000 }).catch(() => {});
  const more = page.getByRole("button", { name: /More actions/ });
  await more.click({ timeout: 6000 }).catch(() => {});
  await page.getByRole("menuitem", { name: /Export/ }).click({ timeout: 6000 }).catch(() => {});
  await wait(1500);
  await page.keyboard.press("Escape");
  await more.click({ timeout: 6000 }).catch(() => {});
  await page.getByRole("menuitem", { name: /Conflict Radar/ }).click({ timeout: 6000 }).catch(() => {});
  await wait(1000);
  await closePanel();
  await open("/settings");
  await scrollTo(page.getByText("Connect an AI assistant (MCP)"));
  await zoomTo(page.getByText("Connect an AI assistant (MCP)").locator("../../.."), 1.4);
  await endScene("s11_more");
  await zoomOut();

  // 12. Closing
  scene();
  await open("/");
  await wait(800);
  const ending = await page.screencast.showOverlay(`
    <div style="position:absolute; inset:0; display:grid; place-items:center; background:rgba(255,255,255,.72); backdrop-filter:blur(6px)">
      <div style="text-align:center; font-family:system-ui,'Segoe UI',sans-serif; color:#12151c">
        <div style="font-size:54px; font-weight:800; letter-spacing:-1px">Research Map</div>
        <div style="margin-top:12px; font-size:22px; color:#2d323c">One canvas for all your tabs. A kind friend who keeps you on your goal.</div>
        <div style="margin-top:22px; display:inline-block; padding:8px 18px; border-radius:999px; background:#12151c; color:#fff; font-size:16px; font-weight:600">Built with Google Gemini</div>
      </div>
    </div>`);
  await endScene("s12_close");
  await wait(1200);
  await page.screencast.stop();
  await ending.dispose(); // overlays stay on the page until removed; the next run must start clean
  return { took, at };
}
