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
  variations?: Array<{
    price: number;
    description: string;
    images?: string[];
  }>;
}

interface SelectedProduct extends Product {
  quantity: number;
  selectedPrice: number;
  selectedVariation?: string;
  discount: number;
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
      
      // Determinar preço inicial (primeiro preço das variações ou 0)
      const initialPrice = p.variations && p.variations.length > 0 ? p.variations[0].price : 0;
      const initialVariation = p.variations && p.variations.length > 0 ? p.variations[0].description : undefined;
      
      return [...old, { 
        ...p, 
        quantity: 1, 
        selectedPrice: initialPrice,
        selectedVariation: initialVariation,
        discount: 0 
      }];
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

  // Atualiza preço/variação do produto selecionado
  const updatePrice = (id: string, variationIndex: number) => {
    setSelectedProducts((old) =>
      old.map((p) => {
        if (p._id === id && p.variations && p.variations[variationIndex]) {
          const variation = p.variations[variationIndex];
          return { 
            ...p, 
            selectedPrice: variation.price,
            selectedVariation: variation.description 
          };
        }
        return p;
      })
    );
  };

  // Atualiza desconto do produto selecionado
  const updateDiscount = (id: string, discount: number) => {
    if (discount < 0) discount = 0;
    if (discount > 100) discount = 100;
    setSelectedProducts((old) =>
      old.map((p) => (p._id === id ? { ...p, discount } : p))
    );
  };

  // Calcular totais
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, p) => {
      return sum + (p.selectedPrice * p.quantity);
    }, 0);

    const totalDiscount = selectedProducts.reduce((sum, p) => {
      const itemTotal = p.selectedPrice * p.quantity;
      const discountAmount = (itemTotal * p.discount) / 100;
      return sum + discountAmount;
    }, 0);

    const total = subtotal - totalDiscount;

    return { subtotal, totalDiscount, total };
  };

  const { subtotal, totalDiscount, total } = calculateTotals();

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
                  {prod.variations && prod.variations.length > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      A partir de R$ {Math.min(...prod.variations.map(v => v.price)).toFixed(2)}
                    </p>
                  )}
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
                    <th className="border border-gray-300 p-2 text-left">Produto</th>
                    <th className="border border-gray-300 p-2 text-left">Variação</th>
                    <th className="border border-gray-300 p-2 text-center">Preço Unit.</th>
                    <th className="border border-gray-300 p-2 text-center">Qtd</th>
                    <th className="border border-gray-300 p-2 text-center">Desconto %</th>
                    <th className="border border-gray-300 p-2 text-center">Total</th>
                    <th className="border border-gray-300 p-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((prod) => {
                    const itemTotal = prod.selectedPrice * prod.quantity;
                    const discountAmount = (itemTotal * prod.discount) / 100;
                    const finalTotal = itemTotal - discountAmount;
                    
                    return (
                      <tr key={prod._id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2">
                          <div>
                            <p className="font-medium text-sm">{prod.model}</p>
                            <p className="text-xs text-gray-600">{prod.type}</p>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2">
                          {prod.variations && prod.variations.length > 1 ? (
                            <select
                              value={prod.variations.findIndex(v => v.description === prod.selectedVariation)}
                              onChange={(e) => updatePrice(prod._id, Number(e.target.value))}
                              className="w-full p-1 text-xs border rounded"
                            >
                              {prod.variations.map((variation, index) => (
                                <option key={index} value={index}>
                                  {variation.description}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-600">
                              {prod.selectedVariation || "-"}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className="text-sm font-medium">R$ {prod.selectedPrice.toFixed(2)}</span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Input
                            type="number"
                            min={1}
                            value={prod.quantity}
                            onChange={(e) =>
                              updateQuantity(prod._id, Number(e.target.value))
                            }
                            className="w-16 mx-auto text-center"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={prod.discount}
                            onChange={(e) =>
                              updateDiscount(prod._id, Number(e.target.value))
                            }
                            className="w-16 mx-auto text-center"
                            placeholder="0"
                          />
                          {prod.discount > 0 && (
                            <p className="text-xs text-yellow-600 mt-1 font-medium">
                              ⚠️ Sujeito à aprovação
                            </p>
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div>
                            <span className="text-sm font-medium">R$ {finalTotal.toFixed(2)}</span>
                            {prod.discount > 0 && (
                              <p className="text-xs text-red-600">
                                (-R$ {discountAmount.toFixed(2)})
                              </p>
                            )}
                          </div>
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {selectedProducts.map((prod) => {
                const itemTotal = prod.selectedPrice * prod.quantity;
                const discountAmount = (itemTotal * prod.discount) / 100;
                const finalTotal = itemTotal - discountAmount;
                
                return (
                  <div key={prod._id} className="border rounded-lg p-3 bg-white">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm">{prod.model}</p>
                        <p className="text-xs text-gray-600">{prod.type}</p>
                        {prod.name && <p className="text-xs text-gray-500">{prod.name}</p>}
                      </div>

                      {/* Variação */}
                      {prod.variations && prod.variations.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">Variação:</label>
                          {prod.variations.length > 1 ? (
                            <select
                              value={prod.variations.findIndex(v => v.description === prod.selectedVariation)}
                              onChange={(e) => updatePrice(prod._id, Number(e.target.value))}
                              className="w-full mt-1 p-2 text-sm border rounded"
                            >
                              {prod.variations.map((variation, index) => (
                                <option key={index} value={index}>
                                  {variation.description} - R$ {variation.price.toFixed(2)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              {prod.selectedVariation} - R$ {prod.selectedPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quantidade e Desconto */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700">Quantidade:</label>
                          <Input
                            type="number"
                            min={1}
                            value={prod.quantity}
                            onChange={(e) =>
                              updateQuantity(prod._id, Number(e.target.value))
                            }
                            className="w-full mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Desconto %:</label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={prod.discount}
                            onChange={(e) =>
                              updateDiscount(prod._id, Number(e.target.value))
                            }
                            className="w-full mt-1"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Aviso de desconto */}
                      {prod.discount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⚠️ Desconto sujeito a aprovação da Celinda
                          </p>
                        </div>
                      )}

                      {/* Totais */}
                      <div className="bg-gray-50 rounded p-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>R$ {itemTotal.toFixed(2)}</span>
                        </div>
                        {prod.discount > 0 && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span>Desconto:</span>
                            <span>-R$ {discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                          <span>Total:</span>
                          <span>R$ {finalTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Botão Remover */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeProduct(prod._id)}
                        className="w-full"
                      >
                        Remover Produto
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Aviso geral de desconto */}
            {selectedProducts.some(p => p.discount > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Este pedido contém descontos que estão sujeitos à aprovação da Celinda
                </p>
              </div>
            )}

            {/* Resumo financeiro */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">Resumo do Pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Produtos: {selectedProducts.length}</span>
                  <span>Itens: {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Desconto total:</span>
                    <span>-R$ {totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-2">
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
        )}
      </Card>
    </div>
  );
}
