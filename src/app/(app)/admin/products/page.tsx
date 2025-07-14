"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, deleteProduct } from "@/api/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

type Product = {
  _id: string;
  model: string;
  type: string;
  type_labels?: string[];
  stock?: string;
  related_products?: string[];
  related_models?: string[];
  variations?: { price: number; description: string }[];
  notes?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await fetchProducts(token);
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

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
      
      // Atualizar a lista removendo o produto deletado
      setProducts(prev => prev.filter(p => p._id !== productId));
      
      // Fechar sidebar se o produto deletado estava sendo visualizado
      if (selectedProduct?._id === productId) {
        setSidebarOpen(false);
        setSelectedProduct(null);
      }
      
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
              {products.map((p, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {products.map((p, idx) => (
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
          ))}
        </div>
      </Card>

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
