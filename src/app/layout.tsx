import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "DevLens — AI Code Intelligence & Diagnostic Engine",
  description: "Advanced developer productivity suite for AST error diagnosis, automated unified git diff patches, architectural complexity analysis, and TSDoc synthesis.",
  keywords: ["compiler diagnostics", "code intelligence", "error explanation", "git patch", "AST analyzer", "developer tool"],
  authors: [{ name: "Omar Tolba", url: "https://github.com/dev-omartolba" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
