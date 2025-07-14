"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, deleteProduct } from "@/api/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

type Product = {
  _id: string;
  model: string;
  type: string;
  brand: string;
  type_labels?: string[];
  stock?: string;
  related_products?: string[];
  related_models?: string[];
  variations?: { price: number; description: string }[];
  notes?: string;
};

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  
  // Paginação
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  const router = useRouter();

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await fetchProducts(token, {
        page,
        limit: pagination.limit,
        category: categoryFilter || undefined,
        name: nameFilter || undefined
      });
      
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadProducts(newPage);
    }
  };

  const openSidebar = (product: Product) => {
    setSelectedProduct(product);
    setSidebarOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productModel: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja deletar o produto "${productModel}"?`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await deleteProduct(productId, token);
      
      // Fechar sidebar se o produto deletado estava sendo visualizado
      if (selectedProduct?._id === productId) {
        setSidebarOpen(false);
        setSelectedProduct(null);
      }
      
      // Recarregar a página atual
      loadProducts(pagination.currentPage);
      
      alert("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto. Tente novamente.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Produtos</h1>
        <Button onClick={() => router.push("/admin/products/new")} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Buscar por nome/modelo</label>
            <Input
              placeholder="Digite o nome ou modelo do produto"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <Input
              placeholder="Ex: Bateria, Touch, Cabo..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2" disabled={loading}>
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setNameFilter("");
                setCategoryFilter("");
                setTimeout(() => loadProducts(1), 100);
              }}
              disabled={loading}
            >
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Status dos resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {loading ? (
            "Carregando produtos..."
          ) : (
            `Mostrando ${products.length} de ${pagination.totalCount} produtos`
          )}
        </div>
      </Card>

      <Card className="p-2 sm:p-4">
        {/* Desktop Table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Modelo</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Carregando produtos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2">{p.model}</td>
                    <td className="p-2">{p.type}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button onClick={() => openSidebar(p)} size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => router.push(`/admin/products/${p._id}/edit`)} size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteProduct(p._id, p.model)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum produto encontrado
            </div>
          ) : (
            products.map((p, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{p.model}</h3>
                    <p className="text-sm text-gray-600">{p.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openSidebar(p)} size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => router.push(`/admin/products/${p._id}/edit`)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteProduct(p._id, p.model)} 
                      size="sm" 
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              {/* Números das páginas */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, pagination.currentPage - 2) + i;
                  if (pageNumber > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[400px] md:w-[500px] max-w-[90vw] md:max-w-[50vw]">
          <SheetHeader>
            <SheetTitle className="text-left">{selectedProduct?.model || "Detalhes do Produto"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <strong className="text-sm font-medium">ID:</strong>
                <p className="text-sm text-gray-600">{selectedProduct?._id}</p>
              </div>
              <div>
                <strong className="text-sm font-medium">Tipo:</strong>
                <p className="text-sm text-gray-600">{selectedProduct?.type}</p>
              </div>
              <div>
                <strong className="text-sm font-medium">Estoque:</strong>
                <p className="text-sm text-gray-600">{selectedProduct?.stock}</p>
              </div>
              
              {selectedProduct?.type_labels && selectedProduct.type_labels.length > 0 && (
                <div>
                  <strong className="text-sm font-medium">Etiquetas:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    {selectedProduct.type_labels.map((label, i) => (
                      <li key={i} className="text-sm text-gray-600">{label}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProduct?.related_models && selectedProduct.related_models.length > 0 && (
                <div>
                  <strong className="text-sm font-medium">Modelos Relacionados:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    {selectedProduct.related_models.map((model, i) => (
                      <li key={i} className="text-sm text-gray-600">{model}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProduct?.related_products && selectedProduct.related_products.length > 0 && (
                <div>
                  <strong className="text-sm font-medium">Produtos Relacionados:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    {selectedProduct.related_products.map((prod, i) => (
                      <li key={i} className="text-sm text-gray-600">{prod}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProduct?.variations && selectedProduct.variations.length > 0 && (
                <div>
                  <strong className="text-sm font-medium">Variações:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    {selectedProduct.variations.map((v, i) => (
                      <li key={i} className="text-sm text-gray-600">
                        {v.description} - R$ {v.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProduct?.notes && (
                <div>
                  <strong className="text-sm font-medium">Notas:</strong>
                  <p className="text-sm text-gray-600 mt-1">{selectedProduct.notes}</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
