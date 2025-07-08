"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/api/products";
import { Card } from "@/components/ui/card";

interface Product {
  _id: string;
  sku?: string;
  name?: string;
  model: string;
  type: string;
}

interface SelectedProduct extends Product {
  quantity: number;
}

export default function SearchAndSelectProducts() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Buscar produtos com debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      const token = localStorage.getItem("token");
      searchProducts(query, token)
        .then(setResults)
        .catch(() => setResults([]));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Adiciona produto com quantidade 1, evitando duplicatas
  const addProduct = (p: Product) => {
    setSelectedProducts((old) => {
      if (old.find((prod) => prod._id === p._id)) return old;
      return [...old, { ...p, quantity: 1 }];
    });
    setQuery("");      // limpa busca ao adicionar
    setResults([]);    // limpa resultados
  };

  // Remove produto da seleção
  const removeProduct = (id: string) => {
    setSelectedProducts((old) => old.filter((p) => p._id !== id));
  };

  // Atualiza quantidade do produto selecionado
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    setSelectedProducts((old) =>
      old.map((p) => (p._id === id ? { ...p, quantity } : p))
    );
  };

  return (
    <div className="max-w-none sm:max-w-4xl mx-auto p-2 sm:p-4">
      <Card className="p-3 sm:p-4">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">Buscar e Selecionar Produtos</h1>

        <Input
          placeholder="Buscar por SKU, nome ou modelo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4"
        />

        {results.length > 0 && (
          <div className="mb-4 border rounded bg-gray-50 p-2 max-h-60 overflow-auto">
            {results.map((prod) => (
              <div
                key={prod._id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b last:border-b-0 py-2 px-2 hover:bg-gray-200 cursor-pointer gap-2"
              >
                <div className="flex-1" onClick={() => addProduct(prod)}>
                  <p className="font-medium text-sm sm:text-base">{prod.model}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{prod.type} {prod.name && `- ${prod.name}`}</p>
                </div>
                <Button 
                  size="sm" 
                  className="self-start sm:self-center w-full sm:w-auto"
                  onClick={() => addProduct(prod)}
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-semibold mb-2">Produtos Selecionados</h2>

        {selectedProducts.length === 0 ? (
          <p className="text-gray-500">Nenhum produto selecionado.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Modelo</th>
                    <th className="border border-gray-300 p-2 text-left">Tipo</th>
                    <th className="border border-gray-300 p-2 text-left">Nome</th>
                    <th className="border border-gray-300 p-2 text-center">Quantidade</th>
                    <th className="border border-gray-300 p-2 text-center">Remover</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2">{prod.model}</td>
                      <td className="border border-gray-300 p-2">{prod.type}</td>
                      <td className="border border-gray-300 p-2">{prod.name || "-"}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        <Input
                          type="number"
                          min={1}
                          value={prod.quantity}
                          onChange={(e) =>
                            updateQuantity(prod._id, Number(e.target.value))
                          }
                          className="w-20 mx-auto"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeProduct(prod._id)}
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {selectedProducts.map((prod) => (
                <div key={prod._id} className="border rounded-lg p-3 bg-white">
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm">{prod.model}</p>
                      <p className="text-xs text-gray-600">{prod.type}</p>
                      {prod.name && <p className="text-xs text-gray-500">{prod.name}</p>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Qtd:</label>
                      <Input
                        type="number"
                        min={1}
                        value={prod.quantity}
                        onChange={(e) =>
                          updateQuantity(prod._id, Number(e.target.value))
                        }
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeProduct(prod._id)}
                        className="ml-auto"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-sm text-gray-600">
                <p>Total de produtos: {selectedProducts.length}</p>
                <p>Quantidade total: {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProducts([])}
                  className="flex-1 sm:flex-none"
                >
                  Limpar Tudo
                </Button>
                <Button className="flex-1 sm:flex-none">
                  Processar Pedido
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
