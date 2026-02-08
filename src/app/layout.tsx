import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Class Buddy",
  description: "Real-time lecture companion with transcription and Q&A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-dark-text min-h-screen">{children}</body>
    </html>
  );
}
