document.addEventListener("DOMContentLoaded", async () => {
  const toggleSeenKey = document.getElementById("toggleSeenKey");
  const clearProgressKey = document.getElementById("clearProgressKey");
  const status = document.getElementById("status");

  const { settings = {} } = await browser.storage.local.get("settings");

  toggleSeenKey.value = settings.toggleSeenKey || "none";
  clearProgressKey.value = settings.clearProgressKey || "ctrl";

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const updatedSettings = {
      toggleSeenKey: toggleSeenKey.value,
      clearProgressKey: clearProgressKey.value
    };

    await browser.storage.local.set({ settings: updatedSettings });
    status.textContent = "Settings saved";
    setTimeout(() => status.textContent = "", 2000);
  });
});
