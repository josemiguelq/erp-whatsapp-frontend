"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts } from "@/api/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Produtos</h1>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      <Card className="p-4">
        <div className="w-full overflow-x-auto">
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
                    <Button onClick={() => openSidebar(p)} size="sm">
                      Ver detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px]">
          <SheetHeader>
            <SheetTitle>{selectedProduct?.model || "Detalhes do Produto"}</SheetTitle>
          </SheetHeader>
          <p><strong>ID:</strong> {selectedProduct?._id}</p>
          <p><strong>Tipo:</strong> {selectedProduct?.type}</p>
          <p><strong>Estoque:</strong> {selectedProduct?.stock}</p>
          <div className="mt-2">
            <strong>Etiquetas:</strong>
            <ul className="list-disc ml-4">
              {selectedProduct?.type_labels?.map((label, i) => <li key={i}>{label}</li>)}
            </ul>
          </div>
          <div className="mt-2">
            <strong>Modelos Relacionados:</strong>
            <ul className="list-disc ml-4">
              {selectedProduct?.related_models?.map((model, i) => <li key={i}>{model}</li>)}
            </ul>
          </div>
          <div className="mt-2">
            <strong>Produtos Relacionados:</strong>
            <ul className="list-disc ml-4">
              {selectedProduct?.related_products?.map((prod, i) => <li key={i}>{prod}</li>)}
            </ul>
          </div>
          <div className="mt-2">
            <strong>Variações:</strong>
            <ul className="list-disc ml-4">
              {selectedProduct?.variations?.map((v, i) => (
                <li key={i}>{v.description} - R$ {v.price.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <p className="mt-2"><strong>Notas:</strong> {selectedProduct?.notes}</p>
        </SheetContent>
      </Sheet>
    </div>
  );
}
