import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  title: "TruthLens — AI Content Detection",
  description: "Detect AI-generated text and images instantly. Free sentence-level analysis powered by forensic AI detection.",
  keywords: "AI detector, ChatGPT detector, AI text detection, deepfake detector, AI image detection",
  openGraph: {
    title: "TruthLens — AI Content Detection",
    description: "Detect AI-generated text and images instantly.",
    url: "https://truthlens.vercel.app",
    siteName: "TruthLens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <GoogleAnalytics gaId="G-J20E9W67K4" />
      </body>
    </html>
  );
}