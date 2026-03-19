import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-zinc-50">
      
      {/* Global Dashboard AI Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/dashboard-bg.png"
          alt="Ambient Party Background"
          fill
          quality={100}
          className="object-cover opacity-60 mix-blend-multiply"
        />
        {/* Soft frost overlay to guarantee text legibility */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
      </div>

      {/* Sidebar Navigation (Bento style) */}
      <aside className="w-64 hidden md:flex flex-col relative z-20 m-4 bento-box border-none shadow-lg">
        <div className="pb-6 border-b border-zinc-200/50 mb-6">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-zinc-900">
            Party<span className="text-emerald-500">Pulse</span>
          </Link>
          <p className="text-xs text-zinc-500 mt-1 truncate">
            {session?.email}
          </p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-zinc-600 font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
            Overview
          </Link>
          <Link href="/dashboard/events/new" className="block px-4 py-2.5 rounded-xl text-zinc-600 font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
            Create Event
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-2.5 rounded-xl text-zinc-600 font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
            Settings
          </Link>
        </nav>

        <div className="pt-6 border-t border-zinc-200/50 mt-6">
          <form action="/api/auth/logout" method="POST">
             <button type="submit" className="w-full text-left px-4 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors">
              Log out
             </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/50 z-20">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-zinc-900">
            Party<span className="text-emerald-500">Pulse</span>
          </Link>
          <button className="p-2 border border-zinc-200 rounded-lg bg-white/50">
            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
