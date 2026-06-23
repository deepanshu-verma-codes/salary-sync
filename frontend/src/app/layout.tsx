import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10 hidden md:flex">
            <div className="p-6">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Salary Sync
              </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/employees" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Employees</span>
              </Link>
            </nav>
            <div className="p-4 border-t border-slate-800 text-sm text-slate-500">
              ACME Corp &copy; 2026
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 flex flex-col h-full overflow-auto relative bg-[#f8fafc]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
