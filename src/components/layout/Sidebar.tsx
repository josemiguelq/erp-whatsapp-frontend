// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "POS", href: "/admin/pos" },
    { name: "Produtos", href: "/admin/products" },
    { name: "Clientes", href: "/admin/customers" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r min-h-screen p-4">
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

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <aside className="relative flex flex-col w-64 bg-white border-r min-h-screen p-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-bold">ERP App</h1>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {links.map(({ name, href }) => (
                <Link
                  key={name}
                  href={href}
                  onClick={onClose}
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
        </div>
      )}
    </>
  );
}
