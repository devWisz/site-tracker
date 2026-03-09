let activeTabId = null;
let timer = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (timer) clearTimeout(timer);

  activeTabId = activeInfo.tabId;
  const tab = await chrome.tabs.get(activeTabId);

  if (!tab.url || !tab.url.startsWith("http")) return;

