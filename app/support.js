"use strict";

(() => {
  const button = document.getElementById("copy-address-btn");
  const address = document.getElementById("wallet-address");
  if (!button || !address) return;

  let resetTimer;
  const resetLabel = () => {
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      button.textContent = "Copy address";
    }, 2000);
  };

  button.addEventListener("click", async () => {
    const value = address.textContent.trim();
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(value);
      button.textContent = "Copied";
    } catch (error) {
      button.textContent = "Copy failed — select manually";
    }
    resetLabel();
  });
})();
