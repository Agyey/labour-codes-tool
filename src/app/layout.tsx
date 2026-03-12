import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "India Labour Code Reform — Legal Intelligence Platform",
  description:
    "Enterprise compliance tracking platform for India's 4 new Labour Codes replacing 29 Acts. Per-act change analysis, state-wise tracking, and compliance workflow management for Tier 1 law firms and large corporates.",
  keywords: [
    "India labour codes",
    "Code on Wages",
    "Industrial Relations Code",
    "Code on Social Security",
    "OSH Working Conditions Code",
    "labour law compliance",
    "legal intelligence",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
