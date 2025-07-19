(async () => {
  let { seen = [], positions = {}, settings = {} } = await browser.storage.local.get(["seen", "positions", "settings"]);

  settings = {
    toggleSeenKey: settings.toggleSeenKey || "none",
    clearProgressKey: settings.clearProgressKey || "ctrl"
  };

  const getPressedKey = (e) => {
    if (e.ctrlKey) return "ctrl";
    if (e.altKey) return "alt";
    if (e.shiftKey) return "shift";
    return "none";
  };

  const updateStyle = (link, url) => {
    link.textContent = link.textContent.replace(/^\(watched\) |\[in progress\] /, "");
    if (seen.includes(url)) {
      link.style.opacity = "0.5";
      link.style.color = "";
      link.textContent = "(watched) " + link.textContent;
    } else if (positions[url]) {
      link.style.opacity = "1";
      link.style.color = "purple";
      link.textContent = "[in progress] " + link.textContent;
    } else {
      link.style.opacity = "1";
      link.style.color = "";
    }
  };

  const markSeen = async (url, link) => {
    if (!seen.includes(url)) {
      seen.push(url);
      await browser.storage.local.set({ seen });
      updateStyle(link, url);
    }
  };

  const unmarkSeen = async (url, link) => {
    seen = seen.filter(v => v !== url);
    await browser.storage.local.set({ seen });
    updateStyle(link, url);
  };

  const setupLinks = () => {
    document.querySelectorAll("a[href$='.mp4']").forEach(link => {
      const url = link.href;
      updateStyle(link, url);

      link.addEventListener("contextmenu", async e => {
        e.preventDefault();
        const pressed = getPressedKey(e);

        if (pressed === settings.clearProgressKey) {
          if (positions[url]) {
            delete positions[url];
            await browser.storage.local.set({ positions });
          }
          updateStyle(link, url);
        } else if (pressed === settings.toggleSeenKey) {
          if (seen.includes(url)) {
            await unmarkSeen(url, link);
          } else {
            await markSeen(url, link);
          }
        }
      });
    });
  };

  const setupVideos = () => {
    document.querySelectorAll("video").forEach(video => {
      const src = video.currentSrc || video.src;
      if (!src) return;

      const saved = positions[src];
      if (saved) {
        video.currentTime = saved;
      }

      video.addEventListener("timeupdate", async () => {
        positions[src] = video.currentTime;
        await browser.storage.local.set({ positions });
      });
    });
  };

  setupLinks();
  setupVideos();
})();
