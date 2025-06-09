"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import StoreHeader from "@/components/layout/StoreHeader";
import { fetchProducts } from "@/api/products";

export default function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleAddToCart = (productId: string) => {
    // Aqui você pode chamar um contexto de carrinho ou API
    console.log("Adicionado ao carrinho:", productId);
  };

  return (
    <div>
      <StoreHeader />
      <main className="p-4">
        {loading ? (
          <p className="text-center text-gray-500">Carregando produtos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => {
              const variation = product.variations?.[0];
              const imageUrl = variation?.images?.[0] || "/placeholder.png";

              return (
                <div
                  key={product._id}
                  className="relative rounded-2xl border p-4 shadow hover:shadow-md transition"
                >
                  <img
                    src={imageUrl}
                    alt={product.model}
                    className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer"
                    onClick={() => router.push(`/store/products/${product._id}`)}
                  />
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-sm text-gray-600">{product.type}</p>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                    title="Adicionar ao carrinho"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
