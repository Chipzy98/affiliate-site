"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/visitors", label: "Visitors", icon: "🌍" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/products/new", label: "Add product", icon: "➕" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : href === "/admin/products"
        ? pathname === "/admin/products" || /^\/admin\/products\/\d+/.test(pathname)
        : pathname.startsWith(href);

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive(l.href) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
          }`}
        >
          <span aria-hidden>{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
