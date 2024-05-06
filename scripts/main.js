const elForm = document.querySelector("form");
const elUrlsList = document.querySelector(".urls-list") || undefined;

const urlsList = JSON.parse(localStorage.getItem("urls")) || [];
// From new tab page to background service worker
chrome.runtime.sendMessage(
  { action: "dataRequest", data: urlsList },
  function (response) {
    console.log("Response from background:", response);
  }
);

// From background service worker to new tab page
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "dataResponse") {
    console.log("Data received in new tab:", message.data);
  }
});

if (elForm) {
  elForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const urlsList = JSON.parse(localStorage.getItem("urls")) || [];
    const url = elForm.elements.namedItem("url").value.trim(); // Trim whitespace
    if (url && !urlsList.includes(url)) {
      urlsList.push(url);
      localStorage.setItem("urls", JSON.stringify(urlsList));
      renderUrls();
    }
    elForm.reset();
  });
}

function renderUrls() {
  if (elUrlsList) {
    elUrlsList.innerHTML = null;
  }
  const urls = JSON.parse(localStorage.getItem("urls")) || [];
  urls.forEach((item) => {
    const newLiEl = document.createElement("li");
    newLiEl.textContent = item;
    elUrlsList.appendChild(newLiEl);
  });
}

renderUrls();

// Track time user spending on each website
let startTime;

// Record start time when the page loads
window.addEventListener("load", () => {
  startTime = Date.now();
  console.log(startTime);
});

// Record end time when the page unloads
window.addEventListener("unload", () => {
  let endTime = Date.now();
  let timeSpent = endTime - startTime;
  console.log(timeSpent);
  chrome.runtime.sendMessage({
    type: "timeSpent",
    hostname: window.location.hostname,
    time: timeSpent,
  });
});
