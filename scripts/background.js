let urls = [];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "dataRequest") {
    urls = message.data;
    // Retrieve data from storage
    chrome.storage.local.get("key", function (data) {
      var storedData = data.key;
      // Send data back to the new tab page
      chrome.runtime.sendMessage({ action: "dataResponse", data: storedData });
    });
    sendResponse("Hi!");
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const isExist = urls.some((item) => {
      return changeInfo.url.includes(item);
    });

    if (isExist) {
      chrome.tabs.remove(tabId, () => {
        chrome.notifications.create({
          type: "basic",
          iconUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSasIydkiFM8Nmx5KTx2iAshCaV_YINqfc5TBrUhN9KA&s",
          title: "Website Blocked",
          message: "Access to YouTube or Instagram is blocked.",
        });
      });
    }
  }
});

let browserHistory = [];

chrome.tabs.onUpdated.addListener((id, change, tab) => {
  console.log("Change", tab);
  const hostname = new URL(tab.url).hostname;

  if (hostname === "newtab") return;

  if (tab.status === "complete") {
    const doesExist = browserHistory.some((site) => site.hostname === hostname);
    const startedTime = new Date();
    console.log(
      startedTime.getHours(),
      startedTime.getMinutes(),
      startedTime.getSeconds()
    );

    if (!doesExist) {
      const newSite = {
        id: tab.id,
        hostname: hostname,
        lastEnteredAt: startedTime,
        closedAt: undefined,
      };
      browserHistory.push(newSite);
    } else {
      console.log("New site");
    }
  }

  console.log(browserHistory);
});

chrome.tabs.onRemoved.addListener(function (tabid, removed) {
  const closedTabIdx = browserHistory.findIndex((tab) => tab.id === tabid);
  const closedTab = browserHistory[closedTabIdx];
  closedTab.closedAt = new Date();
  console.log(closedTab.lastEnteredAt - closedTab.closedAt);
  console.log(browserHistory);
});

chrome.windows.onRemoved.addListener(function (windowid) {
  alert("window closed");
});
