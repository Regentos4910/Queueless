"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Find Queues" },
  { href: "/admin/login?redirectTo=/admin", label: "Admin" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
          QueueLess
        </Link>
        <nav className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                pathname === link.href ? "bg-ink text-white" : "text-slate-600 hover:bg-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
