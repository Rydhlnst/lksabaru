import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteBaseUrl, resolveSiteBaseUrl } from "../lib/site-metadata.ts";

test("uses the public site URL when no deployment override is configured", () => {
  assert.equal(defaultSiteBaseUrl, "https://www.partialfurqonsanden.web.id");
  assert.equal(resolveSiteBaseUrl(), defaultSiteBaseUrl);
  assert.equal(resolveSiteBaseUrl("https://preview.example.com"), "https://preview.example.com");
});
