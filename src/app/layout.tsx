import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dominion Writer — AI-Powered Book Writing Platform",
  description: "Write Without Limits. Create Without Compromise. Your only limitation is your imagination. Bring your own AI API key and write complete books with no word or usage limits.",
  keywords: ["Dominion Writer", "AI writing", "book writing", "novel writing", "AI book generator", "BYO API", "lifetime membership"],
  authors: [{ name: "Mr. Nghia Nguyen" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✍️</text></svg>",
  },
  openGraph: {
    title: "Dominion Writer — Your only limitation is your imagination",
    description: "AI-powered book writing platform with no word limits. Bring your own AI API key.",
    type: "website",
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
        style={{ background: '#0B0F19', color: '#E2E8F0' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}