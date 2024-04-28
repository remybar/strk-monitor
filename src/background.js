const now = () => +Date.now() / 1000;

const memoizeAsync = (fn) => {
  const CACHE_DURATION = 10;

  let lastRunTs = 0;
  let cache;

  return async () => {
    const isCacheExpired = now() - lastRunTs > CACHE_DURATION;

    if (isCacheExpired) {
      lastRunTs = now();
      cache = await fn();
    }

    return cache;
  };
};

const formatPrice = (price) => price.substring(0, 5);

chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name === "fetch-price") fetchPrice();
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local" && changes.strk_price) {
    if (changes.strk_price.newValue === 0) {
      chrome.action.setBadgeText({
        text: "error",
      });
      chrome.action.setBadgeBackgroundColor({ color: "#6e0000" });
    } else {
      chrome.action.setBadgeText({
        text: formatPrice(changes.strk_price.newValue),
      });
      chrome.action.setBadgeBackgroundColor({ color: "#080050" });
    }
  }
});

const getStarknetPrice = memoizeAsync(
  async () =>
    await fetch("https://api.coinbase.com/v2/exchange-rates?currency=STRK")
      .then((response) => response.json())
      .then((data) => {
        return data.data.rates.USDC;
      })
      .catch((error) => {
        console.error("Error fetching the STRK price:", error);
        return null;
      })
);

const fetchPrice = () => {
  getStarknetPrice()
    .catch((err) => {
      console.error(err);
      chrome.storage.local.set({ strk_price: 0 }).then(() => {});
    })
    .then((strk_price) =>
      chrome.storage.local.set({ strk_price }).then(() => {})
    );
};

chrome.alarms.create("fetch-price", { periodInMinutes: 1 });
fetchPrice();

chrome.action.getBadgeText({}, (text) => {
  const isInitialRun = text === "";
  if (isInitialRun) chrome.action.setBadgeText({ text: " - " });
});
chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
