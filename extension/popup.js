const $ = (id) => document.getElementById(id);
chrome.storage.local.get(["token", "tracking", "paused", "workspaceId", "apiBase", "goal"]).then((s) => {
  const st = !s.token ? "Not connected" : !s.tracking ? "Connected · not tracking" : s.paused ? "Paused" : "Tracking";
  $("status").textContent = st;
  if (s.tracking && !s.paused) $("status").classList.add("on");
  $("ws").textContent = s.workspaceId ? "Workspace: " + s.workspaceId : "";
  $("api").value = s.apiBase || "";
  if (s.tracking && s.goal) { $("goaltext").textContent = s.goal; $("goal").hidden = false; }
});
$("save").onclick = async () => {
  await chrome.storage.local.set({ token: $("token").value.trim(), apiBase: $("api").value.trim() || "http://localhost:8080/api/v1" });
  $("status").textContent = "Saved";
};
