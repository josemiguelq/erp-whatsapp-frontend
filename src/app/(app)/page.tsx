import StoreHeader from "@/components/layout/StoreHeader";
import { fetchProducts } from "@/api/products";

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <div>
      <StoreHeader />
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {products.map((product: any) => {
          const variation = product.variations?.[0];
          const imageUrl = variation?.images?.[0] || "/placeholder.png";

          return (
            <div
              key={product.id}
              className="rounded-2xl border p-4 shadow hover:shadow-md transition"
            >
              <img
                src={imageUrl}
                alt={product.model}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h2 className="text-xl font-semibold">{product.model}</h2>
              <p className="text-sm text-gray-600">{product.type}</p>
            </div>
          );
        })}
      </main>
    </div>
  );
}
