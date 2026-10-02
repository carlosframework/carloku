// 🤖 Refuses a pricing page built from a draft price book. build.mjs marks
// such a page with a comment on its first line; publishing it would show
// prices the console refuses to sell. PRICEBOOK_ALLOW_DRAFT=1 lets a review
// build through.
import { readFileSync } from "node:fs";
const page = readFileSync(new URL("../src/pricing/index.html", import.meta.url), "utf8");
const m = page.match(/^<!-- PRICE BOOK (\S+) IS (\S+): not approved for sale, not for publication -->/);
if (m && process.env.PRICEBOOK_ALLOW_DRAFT !== "1") {
  console.error(`src/pricing/index.html is built from the ${m[2].toLowerCase()} price book ${m[1]}; it must not be published. Rebuild from an approved export, or set PRICEBOOK_ALLOW_DRAFT=1 for a review build.`);
  process.exit(1);
}
console.log(m ? `pricing page: DRAFT book ${m[1]} allowed by PRICEBOOK_ALLOW_DRAFT` : "pricing page: built from an approved price book");
