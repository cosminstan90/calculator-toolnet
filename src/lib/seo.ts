import { absoluteURL, organizationConfig, siteConfig } from "./site.ts";
import type { Metadata } from "next";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  imageURL?: string;
  noIndex?: boolean;
};

export const buildMetadata = (input: MetadataInput): Metadata => {
  const canonical = absoluteURL(input.path);
  const image = input.imageURL ?? absoluteURL("/og-default.jpg");

  return {
    title: input.title,
    description: input.description,
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    alternates: {
      canonical,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: canonical,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
};

export const buildBreadcrumbJsonLd = (
  items: Array<{ name: string; path: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteURL(item.path),
  })),
});

export const buildOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: absoluteURL("/"),
  logo: absoluteURL("/logo.svg"),
  email: organizationConfig.supportEmail,
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: organizationConfig.supportEmail,
      contactType: "customer support",
      availableLanguage: ["ro"],
      url: absoluteURL("/contact"),
    },
    {
      "@type": "ContactPoint",
      email: organizationConfig.correctionsEmail,
      contactType: "editorial corrections",
      availableLanguage: ["ro"],
      url: absoluteURL("/contact"),
    },
  ],
});

export const buildWebsiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: absoluteURL("/"),
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteURL("/calculatoare")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildCollectionJsonLd = (args: {
  name: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: args.name,
  description: args.description,
  url: absoluteURL(args.path),
  inLanguage: "ro",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteURL("/"),
  },
});

export const buildItemListJsonLd = (args: {
  name: string;
  path: string;
  items: Array<{ name: string; path: string }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: args.name,
  url: absoluteURL(args.path),
  itemListElement: args.items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: absoluteURL(item.path),
  })),
});

export const buildWebPageJsonLd = (args: {
  name: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: args.name,
  description: args.description,
  url: absoluteURL(args.path),
  inLanguage: "ro",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteURL("/"),
  },
});

export const buildPersonJsonLd = (args: {
  name: string;
  path: string;
  description?: string;
  jobTitle?: string;
  imageURL?: string;
  expertise?: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: args.name,
  description: args.description,
  url: absoluteURL(args.path),
  image: args.imageURL,
  jobTitle: args.jobTitle,
  knowsAbout: args.expertise?.length ? args.expertise : undefined,
  worksFor: {
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteURL("/"),
  },
});

export const buildProfilePageJsonLd = (args: {
  name: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  name: args.name,
  description: args.description,
  url: absoluteURL(args.path),
});

export const buildWebApplicationJsonLd = (args: {
  name: string;
  description: string;
  path: string;
  applicationCategory: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: args.name,
  description: args.description,
  url: absoluteURL(args.path),
  applicationCategory: args.applicationCategory,
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  inLanguage: "ro",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteURL("/"),
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RON",
  },
});

export const buildArticleJsonLd = (args: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string;
  modifiedAt?: string;
  imageURL?: string;
  author?: {
    name: string;
    path: string;
    description?: string;
    jobTitle?: string;
    imageURL?: string;
  };
  articleSection?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: args.title,
  description: args.description,
  datePublished: args.publishedAt,
  dateModified: args.modifiedAt ?? args.publishedAt,
  image: args.imageURL ? [args.imageURL] : undefined,
  mainEntityOfPage: absoluteURL(args.path),
  articleSection: args.articleSection,
  inLanguage: "ro",
  isPartOf: {
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    url: absoluteURL("/blog"),
  },
  about: args.articleSection
    ? {
        "@type": "Thing",
        name: args.articleSection,
      }
    : undefined,
  author: args.author
    ? {
        "@type": "Person",
        name: args.author.name,
        url: absoluteURL(args.author.path),
        description: args.author.description,
        jobTitle: args.author.jobTitle,
        image: args.author.imageURL,
      }
    : {
        "@type": "Organization",
        name: siteConfig.name,
      },
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    logo: {
      "@type": "ImageObject",
      url: absoluteURL("/logo.svg"),
    },
  },
});


