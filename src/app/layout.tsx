import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "PartyPulse | Premium Invites & RSVPs",
  description: "Create stunning custom party invitations and track RSVPs easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans min-h-[100dvh] text-base md:text-lg`}>
        {children}
      </body>
    </html>
  );
}
