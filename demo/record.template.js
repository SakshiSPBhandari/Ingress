// Records the Research Map demo. Generated into record.js by make_record.py (timings and ids are filled in there).
async (page) => {
  const T = __TIMING__;
  const IDS = __IDS__;
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
  await page.screencast.start({ path: __VIDEO__, size: { width: 1280, height: 800 }, fps: 30 });
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
    __CARD__
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
