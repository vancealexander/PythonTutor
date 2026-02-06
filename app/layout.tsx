import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pythonninja.app"),
  title: "Python Ninja - Master Python with AI",
  description: "Master Python with AI-powered training, exercises, and instant feedback. Browser-based Python execution with personalized curriculum.",
  openGraph: {
    title: "Python Ninja - Master Python with AI",
    description: "Master Python with AI-powered training, exercises, and instant feedback. Browser-based Python execution with personalized curriculum.",
    type: "website",
    siteName: "Python Ninja",
  },
  twitter: {
    card: "summary_large_image",
    title: "Python Ninja - Master Python with AI",
    description: "Master Python with AI-powered training, exercises, and instant feedback.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
          strategy="beforeInteractive"
        />
        <SessionProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
