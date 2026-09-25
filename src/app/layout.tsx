import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative AI Academy — Live Schedule",
  description:
    "Live batch controller and digital schedule display for Creative AI Academy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${sora.variable} ${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}