// Generates dist/support.html from the single canonical config source at
// support.config.json. That file is the only place the wallet
// address/network/asset are written — this script is the only consumer.
//
// The QR code encodes the plain receiving address only (no EIP-681 payment
// URI, no amount, no contract-specific encoding), generated locally at
// build time as inline SVG. This keeps the page fully static (no
// third-party QR-generation request) and avoids encoding anything that
// could be wrong in a way that risks funds; the visitor's own wallet is
// responsible for asset/network selection, matching the warning shown
// on the page.
"use strict";

const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { renderPage, escapeHtml } = require("./lib/page-shell");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const CONFIG_PATH = path.join(ROOT, "support.config.json");

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("error: dist/ does not exist. Run the copy-app step before render-support.js.");
    process.exit(1);
  }
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("error: support.config.json not found at repository root.");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const address = config.PUBLIC_SUPPORT_WALLET_ADDRESS;
  const chainName = config.PUBLIC_SUPPORT_CHAIN_NAME;
  const chainId = config.PUBLIC_SUPPORT_CHAIN_ID;
  const asset = config.PUBLIC_SUPPORT_ASSET;

  if (!address) {
    console.error("error: support.config.json is missing PUBLIC_SUPPORT_WALLET_ADDRESS.");
    process.exit(1);
  }

  const qrSvg = await QRCode.toString(address, {
    type: "svg",
    margin: 1,
    color: { dark: "#0e0f11", light: "#e8e6e1" },
  });

  const bodyHtml = `<h1>Support Hummingbird</h1>
<p>Hummingbird is currently a passion project maintained by a single steward. You may voluntarily send support to the public address below.</p>
<div class="support-card">
  <p><strong>Asset:</strong> ${escapeHtml(asset)}</p>
  <p><strong>Network:</strong> ${escapeHtml(chainName)} (chain ID ${escapeHtml(String(chainId))})</p>
  <p><strong>Address:</strong></p>
  <p class="wallet-address" id="wallet-address">${escapeHtml(address)}</p>
  <button type="button" id="copy-address-btn">Copy address</button>
  <div class="qr-code">${qrSvg}</div>
  <p class="qr-note">QR code encodes the receiving address only. Select ${escapeHtml(asset)} on ${escapeHtml(chainName)} in your own wallet before sending.</p>
</div>
<p class="warning"><strong>Verify the asset, network, and receiving address in your wallet before sending. Blockchain transactions are generally irreversible.</strong></p>
<h2>What support does <em>not</em> do</h2>
<p>Support is voluntary. It does not purchase access, membership, influence, voting weight, priority, attribution, preferential treatment, or any other standing in Hummingbird. This is interim personal steward support — it does not begin <a href="roadmap.html">Phase 5</a> (Financial Support) and does not resolve the project's open legal/organizational-structure question.</p>
<h2>Privacy</h2>
<p>Blockchain transactions are not anonymous or confidential. The blockchain itself publicly exposes the receiving address, transfer amounts, timestamps, and transaction relationships to anyone who looks. Hummingbird does not collect supporter identity: no donor accounts, no supporter profiles, no names or emails tied to a transaction, no leaderboards, no badges, and no donation-linked reputation. Hummingbird does not enrich public wallet activity with identity information.</p>
<p>Base Mainnet remains the authoritative record of any support sent. Hummingbird does not maintain a separate internal transaction ledger; if financial transparency reporting is built later, it will derive inbound activity from the chain or an appropriate indexer rather than duplicating it as a primary record.</p>
<p>See <a href="transparency.html">Transparency</a> and <a href="governance.html">Governance</a> for how this fits the project's broader transparency and financial-governance principles.</p>`;

  const html = renderPage({
    title: "Support",
    description: "Voluntary interim support for the Hummingbird steward via a public Base Mainnet USDC address.",
    bodyHtml,
    extraHead: `<script src="support.js" defer></script>`,
    canonicalPath: "support.html",
  });

  fs.writeFileSync(path.join(DIST, "support.html"), html);
  console.log(`page: support.html (address ${address} on ${chainName})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
