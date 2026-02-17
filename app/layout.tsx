import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BiteClub - Build Your Cooking Identity | Social Cooking App",
  description:
    "BiteClub is the cooking identity app for home cooks. Build your cooking profile, track your journey, share recipes with friends, and grow as a cook. Like Strava for cooking.",
  keywords: [
    "cooking identity app",
    "social cooking app",
    "cooking community",
    "home cooking app",
    "recipe sharing app",
    "cooking profile",
    "cooking journal",
    "cooking tracker",
    "strava for cooking",
  ],
  metadataBase: new URL("https://biteclub.fun"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BiteClub - Build Your Cooking Identity",
    description:
      "The social cooking app for home cooks. Build your profile, track your journey, and share what you cook with friends.",
    url: "https://biteclub.fun",
    siteName: "BiteClub",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BiteClub - Build Your Cooking Identity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiteClub - Build Your Cooking Identity",
    description:
      "The social cooking app for home cooks. Build your profile, track your journey, and share what you cook with friends.",
    images: ["/og-image.png"],
  },
  applicationName: "BiteClub",
  appleWebApp: {
    title: "BiteClub",
  },
  other: {
    "apple-itunes-app": "app-id=6748471652",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "BiteClub",
      url: "https://biteclub.fun",
      logo: "https://biteclub.fun/favicon.ico",
      description:
        "BiteClub is the social cooking app that helps home cooks build their cooking identity, track their journey, and connect with friends through food.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "wejarrard@gmail.com",
      },
      sameAs: [
        "https://apps.apple.com/app/id6748471652",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "BiteClub",
      description:
        "The cooking identity app. Build your cooking profile, share recipes, and track your journey as a home cook.",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android",
      url: "https://biteclub.fun",
      downloadUrl: "https://apps.apple.com/app/id6748471652",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Build your cooking profile and identity",
        "Log and document meals with photos",
        "Share recipes with friends",
        "Track your cooking journey over time",
        "Join cooking clubs and communities",
        "Personal digital cookbook",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is BiteClub?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "BiteClub is a social cooking app that helps you build your cooking identity. Like Strava for running or Goodreads for reading, BiteClub creates a living record of who you are as a cook. You can log meals, share recipes, and connect with friends through food.",
          },
        },
        {
          "@type": "Question",
          name: "How is BiteClub different from other recipe apps?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "BiteClub focuses on cooking identity, not just recipes. While other apps are recipe databases, BiteClub builds your personal cooking profile over time. Every dish you log becomes part of your story. There are no algorithms chasing virality, no ads - just authentic sharing with people who matter.",
          },
        },
        {
          "@type": "Question",
          name: "Is BiteClub free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, BiteClub is free to download and use. It is available on iOS and Android.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get started with BiteClub?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Download BiteClub from the App Store or Google Play, create your profile, and start logging what you cook. Every meal becomes part of your cooking identity. Share with friends, join clubs, and watch your cooking story grow.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      name: "BiteClub - Build Your Cooking Identity",
      description:
        "BiteClub is the cooking identity app for home cooks. Build your profile, track your journey, and share recipes with friends.",
      url: "https://biteclub.fun",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".text-xl.lg\\:text-2xl"],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
