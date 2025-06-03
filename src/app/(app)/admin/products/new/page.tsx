"use client";

import { useState, useEffect } from "react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/api/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Variation {
  price: number | "";
  description: string;
  images: string[];
  showUrlInput?: boolean;
  tempImageUrl?: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    type: "",
    stock: "",
    notes: "",
  });

  const [variations, setVariations] = useState<Variation[]>([]);

  useEffect(() => {
    if (formData.type || formData.model) {
      const suggestedName = `${formData.type} ${formData.model}`.trim();
      setFormData((prev) => ({ ...prev, name: suggestedName }));
    }
  }, [formData.type, formData.model]);

  const handleImageUpload = (index: number, files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );

    setVariations((old) => {
      const copy = [...old];
      copy[index].images = [...(copy[index].images || []), ...newImages];
      return copy;
    });
  };

  const handleAddImageUrl = (index: number) => {
    setVariations((old) => {
      const copy = [...old];
      const url = copy[index].tempImageUrl?.trim();
      if (url) {
        copy[index].images.push(url);
        copy[index].tempImageUrl = "";
        copy[index].showUrlInput = false;
      }
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      await createProduct({
        ...formData,
        type_labels: [],
        related_products: [],
        related_models: [],
        variations,
      });
      router.push("/products");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar produto");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Novo Produto</h1>

      <div className="space-y-4">
        <Input
          name="type"
          placeholder="Tipo"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        />
        <Input
          name="model"
          placeholder="Modelo"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        />
        <Input
          name="name"
          placeholder="Nome do produto"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Variações</h2>

        {variations.map((variation, index) => (
          <div key={index} className="space-y-2 mb-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Preço"
                value={variation.price}
                onChange={(e) =>
                  setVariations((old) => {
                    const copy = [...old];
                    copy[index].price =
                      e.target.value === "" ? "" : Number(e.target.value);
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
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setVariations((old) => old.filter((_, i) => i !== index))
                }
              >
                Remover
              </Button>
            </div>

            {/* Upload de arquivos */}
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(index, e.target.files)}
            />

            {/* Adicionar via URL */}
            <div>
              {!variation.showUrlInput ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setVariations((old) => {
                      const copy = [...old];
                      copy[index].showUrlInput = true;
                      return copy;
                    })
                  }
                >
                  + Adicionar imagem via link
                </Button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={variation.tempImageUrl || ""}
                    onChange={(e) =>
                      setVariations((old) => {
                        const copy = [...old];
                        copy[index].tempImageUrl = e.target.value;
                        return copy;
                      })
                    }
                  />
                  <Button onClick={() => handleAddImageUrl(index)}>Adicionar</Button>
                </div>
              )}
            </div>

            {/* Preview das imagens */}
            <div className="flex gap-2 mt-2 overflow-x-auto">
  {variation.images?.map((img, i) => (
    <div key={i} className="relative group w-20 h-20">
      <img
        src={img}
        alt={`img-${i}`}
        className="w-full h-full object-cover rounded-md border"
      />
      <button
        type="button"
        onClick={() =>
          setVariations((old) => {
             const copy = [...old];
      copy[index] = {
        ...copy[index],
        images: copy[index].images.filter((_, imgIndex) => imgIndex !== i),
      };
      return copy;
          })
        }
        className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition"
      >
        <Trash size={14} />
      </button>
    </div>
  ))}
</div>
          </div>
        ))}

        <Button
          onClick={() =>
            setVariations((old) => [
              ...old,
              { price: "", description: "", images: [] },
            ])
          }
          className="mt-2"
        >
          + Adicionar Variação
        </Button>
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit} className="w-full">
          Salvar Produto
        </Button>
      </div>
    </div>
  );
}
