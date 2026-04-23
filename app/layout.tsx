import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIG Social Preview",
  description: "Create shareable social post approval previews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
