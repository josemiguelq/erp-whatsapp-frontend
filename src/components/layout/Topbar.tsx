// components/layout/Topbar.tsx
"use client";

import { useState } from "react";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = "João Miguel"; // Você pode pegar isso de um contexto/autenticado
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="flex justify-end items-center bg-white border-b p-4 relative">
      <div className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold"
        >
          {initials}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
