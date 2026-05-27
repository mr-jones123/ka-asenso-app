import type { Metadata } from "next";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import "./globals.css";

const cabinet = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/CabinetGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/CabinetGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/CabinetGrotesk-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ka Asenso — Voice AI Franchise Sales Agent",
  description:
    "Ka Asenso qualifies undecided franchise buyers by voice, matches them to a best-fit Philippine franchise, and hands franchisors a scored, structured lead.",
  openGraph: {
    title: "Ka Asenso",
    description: "Voice AI for Philippine franchise buyers.",
    siteName: "Ka Asenso",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cabinet.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
