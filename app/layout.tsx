import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./providers";
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
  title: "HelpDeskPro - Support Ticket Management",
  description: "Centralized Support Ticket Management System with role-based access control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
