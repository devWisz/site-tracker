const saveTabBtn = document.getElementById("saveTab");
const toggleHistoryBtn = document.getElementById("toggleHistory");
const resetBtn = document.getElementById("resetData");
const manualUrl = document.getElementById("manualUrl");
const addManualBtn = document.getElementById("addManual");
const searchInput = document.getElementById("searchInput");

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

    let sortedSites = Object.entries(sites).sort((a, b) => b[1].visits - a[1].visits);

    sortedSites.forEach(([key, site]) => {

      if (searchInput.value && !site.name.includes(searchInput.value.toLowerCase())) return;

      if (site.visits > maxVisits) {
        maxVisits = site.visits;
        maxSite = site.name + " (" + site.visits + ")";
      }

      const percent = maxVisits ? (site.visits / maxVisits) * 100 : 0;

      const card = document.createElement("div");
      card.className = "site-card";

      card.innerHTML = `
        <div class="site-top">
          <div style="display:flex; gap:8px; align-items:center;">
            <img class="site-favicon" src="https://www.google.com/s2/favicons?domain=${site.url}">
            <div class="site-name">${site.name}</div>
          </div>
          <div>Visits: ${site.visits}</div>
        </div>
        <div class="site-url">${site.url}</div>
        <div class="site-progress">
          <div class="site-progress-bar" style="width:${percent}%"></div>
        </div>
      `;

      const actions = document.createElement("div");
      actions.className = "site-actions";

      const openBtn = document.createElement("button");
      openBtn.className = "secondary small";
      openBtn.textContent = "Open";
      openBtn.onclick = () => chrome.tabs.create({ url: site.url });

      const resetCountBtn = document.createElement("button");
      resetCountBtn.className = "secondary small";
      resetCountBtn.textContent = "Reset Count";
      resetCountBtn.onclick = () => {
        site.visits = 0;
        chrome.storage.local.set({ sites }, render);
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "danger small";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => {
        delete sites[key];
        chrome.storage.local.set({ sites }, render);
      };

      actions.appendChild(openBtn);
      actions.appendChild(resetCountBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(actions);
      historyList.appendChild(card);
    });

    mostVisitedEl.textContent = maxSite;
  });
}

searchInput.addEventListener("input", render);

saveTabBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.url.startsWith("http")) return;

    const hostname = new URL(tab.url).hostname.replace("www.", "");

    chrome.storage.local.get(["sites"], (data) => {
      let sites = data.sites || {};

      if (!sites[hostname]) {
        sites[hostname] = {
          name: extractName(tab.url),
          url: tab.url,
          visits: 0
        };
      }

      chrome.storage.local.set({ sites }, render);
    });
  });
};

addManualBtn.onclick = () => {
  if (!manualUrl.value) return;

  let url = manualUrl.value.startsWith("http")
    ? manualUrl.value
    : "https://" + manualUrl.value;

  const hostname = new URL(url).hostname.replace("www.", "");

  chrome.storage.local.get(["sites"], (data) => {
    let sites = data.sites || {};

    sites[hostname] = {
      name: extractName(url),
      url: url,
      visits: 0
    };

    chrome.storage.local.set({ sites }, () => {
      manualUrl.value = "";
      render();
    });
  });
};

toggleHistoryBtn.onclick = () => {
  historySection.classList.toggle("hidden");
  toggleHistoryBtn.textContent =
    historySection.classList.contains("hidden")
      ? "Show History"
      : "Hide History";
};

resetBtn.onclick = () => { 
  chrome.storage.local.clear(() => render());
};

document.addEventListener("DOMContentLoaded", render);