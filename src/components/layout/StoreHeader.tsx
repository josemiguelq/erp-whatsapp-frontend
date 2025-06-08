"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUser, logout } from "@/api/api";
import { useRouter } from "next/navigation";

const categories = ["Módulos", "Telas", "Ferramentas"];

export default function StoreHader() {
  const [user, setUser] = useState<null | { name: string }>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getUser(); // Deve fazer GET /me com token
        if (me?.name) setUser(me);
      } catch (err) {
        console.log(err);
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
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-red-600">
            JoelExpress
          </Link>

          <Input placeholder="Buscar produtos..." className="max-w-md w-full mx-4" />

          <div className="flex items-center gap-4">
            {/* Perfil com Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!user ? (
                  <DropdownMenuItem onClick={() => router.push("/login")}>
                    Login / Registrar
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/orders")}>
                      Meus Pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Carrinho */}
            <Button variant="ghost">
              <ShoppingCart size={20} />
            </Button>
          </div>
        </div>

        {/* Menu de categorias */}
        <nav className="bg-gray-100 border-t">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-6 text-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                className="text-gray-700 hover:text-red-500 font-medium transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>
  );
}
