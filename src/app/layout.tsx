import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VenueFlowAI — Smart Venue Companion",
  description: "Real-time crowd intelligence and AI-powered venue navigation powered by Claude",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
