import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "That's My Dawg",
  description:
    "Upload your dog, drop it into a hand-designed scene, order the printed tee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
