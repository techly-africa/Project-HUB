import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rukisha — Project Tracker",
  description: "Merchant Lending Product — Implementation Tracker",
};

import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
