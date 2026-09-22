import type { Metadata } from "next";

const shareImagePath = "/og-image.jpg";
export const defaultSiteBaseUrl = "https://www.pantialfurqonsanden.web.id";

export function resolveSiteBaseUrl(configuredBaseUrl?: string): string {
  return configuredBaseUrl?.trim() || defaultSiteBaseUrl;
}

interface SiteMetadataInput {
  organizationName: string;
  description: string;
  baseUrl: string;
}

export function buildSiteMetadata({
  organizationName,
  description,
  baseUrl,
}: SiteMetadataInput): Metadata {
  const metadataBase = new URL(baseUrl);
  const shareImageUrl = new URL(shareImagePath, metadataBase).toString();

  return {
    metadataBase,
    title: organizationName,
    description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: organizationName,
      title: organizationName,
      description,
      url: metadataBase,
      images: [
        {
          url: shareImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: organizationName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: organizationName,
      description,
      images: [shareImageUrl],
    },
  };
}

