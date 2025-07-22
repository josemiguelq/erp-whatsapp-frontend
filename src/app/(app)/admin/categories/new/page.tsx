"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/api/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function NewCategoryPage() {
  const [formData, setFormData] = useState({
    name: "",
    synonyms: [] as string[]
  });
  const [newSynonym, setNewSynonym] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const addSynonym = () => {
    const synonym = newSynonym.trim();
    if (synonym && !formData.synonyms.includes(synonym)) {
      setFormData({
        ...formData,
        synonyms: [...formData.synonyms, synonym]
      });
      setNewSynonym("");
    }
  };

  const removeSynonym = (index: number) => {
    setFormData({
      ...formData,
      synonyms: formData.synonyms.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Nome da categoria é obrigatório");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await createCategory(formData.name.trim(), formData.synonyms, token);
      
      alert("Categoria criada com sucesso!");
      router.push("/admin/categories");
    } catch (err: unknown) {
      console.error("Erro ao criar categoria:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar categoria";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">Nova Categoria</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Bateria, Touch/Display, Cabo..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Nome principal da categoria. Deve ser único e descritivo.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Sinônimos</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: battery, bateria, pila..."
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSynonym();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSynonym}
                disabled={isLoading || !newSynonym.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Palavras alternativas que podem ser usadas para encontrar esta categoria.
              Útil para termos em outros idiomas ou variações do nome.
            </p>

            {/* Lista de sinônimos */}
            {formData.synonyms.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Sinônimos adicionados:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.synonyms.map((synonym, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                    >
                      {synonym}
                      <button
                        type="button"
                        onClick={() => removeSynonym(index)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? "Criando..." : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Dica sobre uso */}
      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">💡 Dicas para categorias:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use nomes claros e descritivos</li>
            <li>• Adicione sinônimos em português, inglês e espanhol</li>
            <li>• Evite categorias muito específicas ou muito genéricas</li>
            <li>• Sinônimos melhoram a busca e usabilidade</li>
          </ul>
        </div>
      </Card>
    </div>
  );
} 