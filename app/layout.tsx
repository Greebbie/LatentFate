import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/nav/header";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LatentFate — Symbolic Forecasting Engine",
  description:
    "Everything can be predicted. We learned that from machine learning. Results are projections, not prophecies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
