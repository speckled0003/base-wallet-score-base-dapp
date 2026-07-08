import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  keywords: ["Base", "Base builder", "onchain", "dApp", "wallet"],
  metadataBase: new URL("https://base-wallet-score.vercel.app"),
  title: "Base Wallet Score",
  // Base builder identity: project-level proof uses Build ID, Builder Wallet, Vercel Live Demo, and GitHub repository.
  description:
    "A clean wallet profile card for Base with score, tier, badges, balance, Basescan link, and shareable identity.",
  other: {
    "base:app_id": "69ffea109ee68cd142d1afe3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
