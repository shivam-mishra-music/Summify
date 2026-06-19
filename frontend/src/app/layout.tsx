import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summify — AI Meeting Intelligence",
  description: "Turn any video into actionable insights instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}