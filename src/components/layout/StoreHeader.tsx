"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUser } from "@/api/api";
import { useRouter } from "next/navigation";

const categories = ["Bateria", "Touch/Display", "Cabo", "Carregador", "Capinha", "Película"];

interface StoreHeaderProps {
  onSearch?: (searchTerm: string) => void;
  onCategorySelect?: (category: string) => void;
}

export default function StoreHeader({ onSearch, onCategorySelect }: StoreHeaderProps) {
  const [user, setUser] = useState<null | { name: string }>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const me = await getUser(token); // Deve fazer GET /me com token
        if (me?.name) setUser(me);
      } catch (err) {
        console.log(err);
        setUser(null); // Sem usuário
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.refresh(); // ou router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (      
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-red-600">
            JoelExpress
          </Link>

          <form onSubmit={handleSearch} className="max-w-md w-full mx-4">
            <Input 
              placeholder="Buscar produtos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </form>

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
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-6 text-sm overflow-x-auto">
            <button
              onClick={() => handleCategoryClick("")}
              className="text-gray-700 hover:text-red-500 font-medium transition whitespace-nowrap"
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="text-gray-700 hover:text-red-500 font-medium transition whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>
  );
}
