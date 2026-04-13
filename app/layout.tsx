import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Neighborhood - Manajemen Komunitas",
  description: "Aplikasi manajemen komunitas untuk pengelolaan warga, jadwal keamanan, feedback, dan pengumuman",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smart Neighborhood",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#003366",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Smart Neighborhood" />
        <meta name="msapplication-TileColor" content="#003366" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IOSInstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(reg => {
                    console.log('Service Worker registered:', reg);
                  }).catch(err => {
                    console.log('Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
        <ErrorBoundary>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
