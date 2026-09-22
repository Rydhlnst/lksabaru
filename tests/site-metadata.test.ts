import assert from "node:assert/strict";
import test from "node:test";
import { buildSiteMetadata } from "../lib/site-metadata.ts";

test("builds share metadata with an absolute OG image URL", () => {
  const metadata = buildSiteMetadata({
    organizationName: "LKSA Muhammadiyah",
    description: "A safe home and education for children.",
    baseUrl: "https://lksa.example.com",
  });
  const openGraph = metadata.openGraph as {
    type?: string;
    images?: Array<{ url?: string }>;
  };
  const twitter = metadata.twitter as { card?: string };

  assert.equal(metadata.metadataBase?.toString(), "https://lksa.example.com/");
  assert.equal(openGraph.type, "website");
  assert.equal(openGraph.images?.[0]?.url, "https://lksa.example.com/media/logo-lksa-transparent.png");
  assert.equal(twitter.card, "summary_large_image");
});
