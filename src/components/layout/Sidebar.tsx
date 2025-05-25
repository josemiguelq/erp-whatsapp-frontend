// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Produtos", href: "/produtos" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h1 className="text-lg font-bold mb-6">ERP App</h1>
      <nav className="space-y-2">
        {links.map(({ name, href }) => (
          <Link
            key={name}
            href={href}
            className={cn(
              "block px-4 py-2 rounded hover:bg-gray-100",
              pathname === href && "bg-gray-200 font-medium"
            )}
          >
            {name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
