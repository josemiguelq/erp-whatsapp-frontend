"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

import StoreHeader from "@/components/layout/StoreHeader";
import { Button } from "@/components/ui/button";
import { fetchStoreProducts, StoreProduct, StorePaginationData } from "@/api/store";

export default function HomePage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<StorePaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const router = useRouter();

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchStoreProducts({
        page,
        limit: 12,
        search: searchTerm || undefined,
        category: categoryFilter || undefined
      });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadProducts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCategorySelect = (category: string) => {
    setCategoryFilter(category);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Recarregar produtos quando filtros mudarem
  useEffect(() => {
    loadProducts(1);
  }, [searchTerm, categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = (productId: string) => {
    // Aqui você pode chamar um contexto de carrinho ou API
    console.log("Adicionado ao carrinho:", productId);
  };

  return (
    <div>
      <StoreHeader onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
      <main className="p-4">
        {/* Filtros ativos */}
        {(searchTerm || categoryFilter) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Filtros ativos: 
              {searchTerm && <span className="ml-1 font-medium">Busca: {searchTerm}</span>}
              {searchTerm && categoryFilter && <span className="mx-1">•</span>}
              {categoryFilter && <span className="ml-1 font-medium">Categoria: {categoryFilter}</span>}
            </p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Carregando produtos...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const variation = product.variations?.[0];
                const imageUrl = variation?.images?.[0] || "/placeholder.png";
                const price = variation?.price || 0;

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
                    <h2 className="text-lg font-semibold">{product.name || product.model}</h2>
                    <p className="text-sm text-gray-600">{product.type}</p>
                    {price > 0 && (
                      <p className="text-lg font-bold text-green-600 mt-2">
                        R$ {price.toFixed(2)}
                      </p>
                    )}

                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                      title="Adicionar ao carrinho"
                    >
                      <ShoppingCart className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage || loading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>
                
                <span className="text-sm text-gray-600">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Informações dos resultados */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Mostrando {products.length} de {pagination.totalCount} produtos
            </div>
          </>
        )}
      </main>
    </div>
  );
}
