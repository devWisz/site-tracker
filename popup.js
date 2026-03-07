const saveTabBtn = document.getElementById("saveTab");
const toggleHistoryBtn = document.getElementById("toggleHistory");
const resetBtn = document.getElementById("resetData");
const manualUrl = document.getElementById("manualUrl");
const addManualBtn = document.getElementById("addManual");


const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

const totalVisitsEl = document.getElementById("totalVisits");
const mostVisitedEl = document.getElementById("mostVisited");

function extractName(url) {
  return new URL(url).hostname.replace("www.", "").split(".")[0];
}

function render() {
  chrome.storage.local.get(["sites", "totalVisits"], (data) => {
    const sites = data.sites || {};
    const totalVisits = data.totalVisits || 0;

    totalVisitsEl.textContent = totalVisits;

    historyList.innerHTML = "";

    let maxVisits = 0;
    let maxSite = "None";

    Object.keys(sites).forEach((key) => {
      const site = sites[key];

      if (site.visits > maxVisits) {
        maxVisits = site.visits;
        maxSite = site.name + " (" + site.visits + ")";
      }

      const card = document.createElement("div");
      card.className = "site-card";

      card.innerHTML = `
        <div class="site-top">
          <div class="site-name">${site.name}</div>
          <div>Visits: ${site.visits}</div>
        </div>
        <div class="site-url">${site.url}</div>
      `;

      const actions = document.createElement("div");
      actions.className = "site-actions";

      const openBtn = document.createElement("button");
      openBtn.className = "secondary small";
      openBtn.textContent = "Open";
      openBtn.onclick = () => {
        chrome.tabs.create({ url: site.url });
      };
