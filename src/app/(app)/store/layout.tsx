"use client";

import { useEffect, useState } from "react";
import { getUser, logout } from "@/api/api";
import { useRouter } from "next/navigation";
import StoreHader from "@/components/layout/StoreHeader";

const categories = ["Módulos", "Telas", "Ferramentas"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | { name: string }>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getUser(); // Deve fazer GET /me com token
        if (me?.name) setUser(me);
      } catch (err) {
        console.log(err)
        setUser(null); // Sem usuário
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout(); // remove token do localStorage
    setUser(null);
    router.refresh(); // ou router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <StoreHader/>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
