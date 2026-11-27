// Reuse terms for Hummingbird's own published text, as decided in ADR 0028.
// The build attaches these to every public record, the records index, the bulk
// download and the changes listing, so a copied record keeps its terms. This
// restates ADR 0028; it decides nothing new.
"use strict";

const LICENSE = "CC-BY-4.0";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const CREDIT = "Hummingbird (datum.quest)";
const TERMS_URL = "https://datum.quest/decisions/0028-content-license-cc-by-4";

const REUSE = Object.freeze({
  license: LICENSE,
  license_url: LICENSE_URL,
  credit: CREDIT,
  terms: TERMS_URL,
  attribution: `Reuse credits "${CREDIT}", names the license, links to it, and says if the text was changed. A link to the source page or document satisfies the credit.`,
  covers: "Hummingbird's own text, including records in its own words and syntheses. Software is MIT.",
  contributed_material: "A Hummingbird record that synthesizes a contribution is covered only as far as it is Hummingbird's own wording; the contributor's own words, at the source the record links, keep their author's terms.",
});

// The short form carried by each item, so one copied entry still says its terms.
function itemReuse() {
  return { license: LICENSE, license_url: LICENSE_URL, credit: CREDIT, terms: TERMS_URL };
}

module.exports = { LICENSE, LICENSE_URL, CREDIT, TERMS_URL, REUSE, itemReuse };
