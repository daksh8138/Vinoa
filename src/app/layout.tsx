import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Vinoa - Image to ASCII Art",
  description:
    "Convert images to ASCII art with a beautiful, Excalidraw-inspired canvas interface. Drag & drop, paste, customize, and export.",
  metadataBase: new URL("https://vinoa.vercel.app"),
  icons: {
    icon: "/vinoa.png",
  },
  keywords: [
    "ascii art",
    "image converter",
    "ascii generator",
    "text art",
    "image to text",
  ],
  authors: [{ name: "Rudro", url: "https://rudro.dev" }],
  creator: "Rudro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vinoa.vercel.app",
    siteName: "Vinoa",
    title: "Vinoa - Image to ASCII Art",
    description:
      "Convert images to ASCII art with a beautiful, Excalidraw-inspired canvas interface. Drag & drop, paste, customize, and export.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Vinoa - Image to ASCII Art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinoa - Image to ASCII Art",
    description:
      "Convert images to ASCII art with a beautiful, Excalidraw-inspired canvas interface.",
    images: ["/og.png"],
    creator: "@notrudro",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
