import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGate from "@/components/AuthGate";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "משפחת לוין",
  description: "ניהול משק בית משפחתי",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "משפחת לוין",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${rubik.variable} font-sans antialiased`}>
        <AuthProvider>
          <AuthGate>
            <main className="max-w-lg mx-auto min-h-screen pb-20">{children}</main>
            <Navigation />
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
