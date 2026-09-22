import type { Metadata } from "next";

const shareImagePath = "/media/logo-payf.png";
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

