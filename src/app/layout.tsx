import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthWise - Track Your Wealth and Investments",
  description: "A modern platform to monitor your portfolio, track investments, and achieve your financial goals.",
  keywords: ["WealthWise", "Finance", "Investment", "Portfolio", "Net Worth", "Crypto", "ETF", "Financial Goals"],
  authors: [{ name: "WealthWise" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "WealthWise",
    description: "Track your wealth and investments with confidence",
    url: "https://wealthwise.app",
    siteName: "WealthWise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WealthWise",
    description: "Track your wealth and investments with confidence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
