import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Food Kingdom Admin ERP | Production Restaurant Management",
  description: "Next.js 15 Production-ready ERP and Admin Panel for Multi-branch Restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FFFDF8] text-stone-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
