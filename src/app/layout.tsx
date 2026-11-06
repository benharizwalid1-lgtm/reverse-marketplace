import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "REVERSE — Stop buying. Start finding.",
  description:
    "A collaborative marketplace for borrowing, giving, swapping, and exchanging skills. Don't start with what you want to sell. Start with what you need.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Suspense fallback={<header className="h-[72px]" />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
