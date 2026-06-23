import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

const font = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACME Salary Sync",
  description: "Enterprise Salary Management Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} text-slate-900 antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
