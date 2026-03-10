let activeTabId = null;
let timer = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (timer) clearTimeout(timer);

  activeTabId = activeInfo.tabId;
  const tab = await chrome.tabs.get(activeTabId);  

  if (!tab.url || !tab.url.startsWith("http")) return; 

  timer = setTimeout(() => {
    const hostname = new URL(tab.url).hostname.replace("www.", "");

    chrome.storage.local.get(["sites", "totalVisits"], (data) => {
      let sites = data.sites || {};
      let totalVisits = data.totalVisits || 0;

      if (!sites[hostname]) return;

      sites[hostname].visits += 1;
      totalVisits += 1;

      chrome.storage.local.set({ sites, totalVisits });
    });

  }, 5000);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId && timer) {
    clearTimeout(timer);
  }
});  