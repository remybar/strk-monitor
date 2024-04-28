const formatPrice = (price) => `${price} USDC`;

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local" && changes.strk_price) {
    const value =
      changes.strk_price.newValue === 0 ? "error" : changes.strk_price.newValue;
  }

  document.getElementById("strkPrice").innerHTML = formatPrice(value);
});

chrome.storage.local.get(["strk_price"]).then((res) => {
  document.getElementById("strkPrice").innerHTML = formatPrice(
    res["strk_price"]
  );
});
