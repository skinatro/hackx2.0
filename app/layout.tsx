import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import ClientChrome from "./components/ClientChrome";
import { ThemeProvider } from "./providers/theme-provider";

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
  title: "HackX 2.0 - Digital Bharat Innovation Challenge",
  description: "Join India's premier hackathon for building solutions for Digital Bharat. Organized by CSI SFIT and GDG SFIT.",
  icons: {
    icon: [
      {
        url: "/favicon.ico?v=2",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        url: "/icon.png?v=2",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: {
      url: "/apple-icon.png?v=2",
      sizes: "180x180",
      type: "image/png",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // For iPhone X notch
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black overflow-x-hidden`}
      >
        <ThemeProvider>
          <ClientChrome />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
