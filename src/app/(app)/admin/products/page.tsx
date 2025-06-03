"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/api/products";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Produtos</h1>
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
                  <Button onClick={() => openSidebar(p)}>Ver detalhes</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px]">
          <h2 className="text-lg font-semibold mb-2">{selectedProduct?.model}</h2>
          <p><strong>Tipo:</strong> {selectedProduct?._id}</p>
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
