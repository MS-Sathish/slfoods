import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
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
  title: "Shree Laxmi Foods - Wholesale Snacks Partner",
  description: "B2B Wholesale Order Management System - Order snacks, track deliveries, manage payments easily",
  manifest: "/manifest.json",
  applicationName: "Shree Laxmi Foods",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shree Laxmi Foods",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://shreelaxmifoods.com",
    siteName: "Shree Laxmi Foods",
    title: "Shree Laxmi Foods - Wholesale Snacks Partner",
    description: "B2B Wholesale Order Management System - Order snacks, track deliveries, manage payments easily",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Shree Laxmi Foods - Wholesale Snacks Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Laxmi Foods - Wholesale Snacks Partner",
    description: "B2B Wholesale Order Management System",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#15803d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shree Laxmi Foods" />
        <meta name="msapplication-TileColor" content="#15803d" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192.png" />

        {/* Splash Screens for iOS */}
        <link rel="apple-touch-startup-image" href="/og-image.svg" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
