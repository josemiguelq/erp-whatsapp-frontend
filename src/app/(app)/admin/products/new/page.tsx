"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";  // import do useRouter
import { createProduct } from "@/api/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Variation {
  price: number | "";
  description: string;
}

export default function NewProductPage() {
  const router = useRouter();  // hook para redirecionar

  const [formData, setFormData] = useState({
    model: "",
    type: "",
    stock: "",
    notes: "",
  });

  const [variations, setVariations] = useState<Variation[]>([]);

  // ... funções handleChange, handleVariationChange, addVariation, removeVariation ...

  const handleSubmit = async () => {
    try {
      await createProduct({
        ...formData,
        type_labels: [],
        related_products: [],
        related_models: [],
        variations,
      });
      // redireciona para /products após criar com sucesso
      router.push("/products");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar produto");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Novo Produto</h1>

      {/* inputs do form */}
      <div className="space-y-4">
        <Input
          name="model"
          placeholder="Modelo"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        />
        <Input
          name="type"
          placeholder="Tipo"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        />
        <Input
          name="stock"
          placeholder="Estoque"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        />
        <Textarea
          name="notes"
          placeholder="Notas"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* variações */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Variações</h2>

        {variations.map((variation, index) => (
          <div key={index} className="flex space-x-2 items-center mb-2">
            <Input
              type="number"
              placeholder="Preço"
              value={variation.price}
              onChange={(e) =>
                setVariations((old) => {
                  const copy = [...old];
                  copy[index].price = e.target.value === "" ? "" : Number(e.target.value);
                  return copy;
                })
              }
              className="w-24"
              min={0}
              step="0.01"
            />
            <Input
              placeholder="Descrição"
              value={variation.description}
              onChange={(e) =>
                setVariations((old) => {
                  const copy = [...old];
                  copy[index].description = e.target.value;
                  return copy;
                })
              }
              className="flex-1"
            />
            <Button variant="destructive" size="sm" onClick={() => {
              setVariations((old) => old.filter((_, i) => i !== index));
            }}>
              Remover
            </Button>
          </div>
        ))}

        <Button onClick={() => setVariations((old) => [...old, { price: "", description: "" }])} className="mt-2">
          + Adicionar Variação
        </Button>
      </div>

      {/* submit */}
      <div className="mt-6">
        <Button onClick={handleSubmit} className="w-full">
          Salvar Produto
        </Button>
      </div>
    </div>
  );
}
