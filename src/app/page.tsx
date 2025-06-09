import StoreHeader from "@/components/layout/StoreHeader";
import { fetchProducts } from "@/api/products";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <div>
      <StoreHeader />
      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => {
            const variation = product.variations?.[0];
            const imageUrl = variation?.images?.[0] || "/placeholder.png";

            return (
              <div
                key={product._id}
                className="relative rounded-2xl border p-4 shadow hover:shadow-md transition"
              >
                <Link href={`/store/products/${product._id}`}>
                  <img
                    src={imageUrl}
                    alt={product.model}
                    className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer"
                  />
                </Link>
                <h2 className="text-xl font-semibold">{product.model}</h2>
                <p className="text-sm text-gray-600">{product.type}</p>

                {/* Botão de carrinho apenas decorativo aqui */}
                <button
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow"
                  title="Adicionar ao carrinho"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
