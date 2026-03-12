import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "react-hot-toast";

const jakarta = Plus_Jakarta_Sans({
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
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-blue-500/30">
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#1e293b",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#f8fafc" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#f8fafc" },
            },
          }}
        />
      </body>
    </html>
  );
}
