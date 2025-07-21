"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getModelById, updateModel } from "@/api/models";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function EditModelPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
  });
  
  const [showBrands, setShowBrands] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Marcas principais hardcoded
  const brands = [
    "Apple",
    "Samsung", 
    "Xiaomi",
    "Motorola",
    "Huawei",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Realme",
    "LG",
    "Sony",
    "Nokia",
    "Google",
    "Nothing"
  ];

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBrands(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Carregar dados do modelo
  useEffect(() => {
    const loadModel = async () => {
      try {
        const token = localStorage.getItem("token");
        const model = await getModelById(modelId, token);
        
        setFormData({
          brand: model.brand,
          model: model.model,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar modelo:", error);
        alert("Erro ao carregar modelo");
        router.push("/admin/models");
      }
    };

    if (modelId) {
      loadModel();
    }
  }, [modelId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model.trim()) {
      alert("Por favor, selecione uma marca e digite o modelo");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      await updateModel(modelId, formData.brand, formData.model, token);
      
      alert("Modelo atualizado com sucesso!");
      router.push("/admin/models");
    } catch (error: unknown) {
      console.error("Erro ao atualizar modelo:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar modelo";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const selectBrand = (brand: string) => {
    setFormData({ ...formData, brand });
    setShowBrands(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando modelo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar Modelo</h1>
        <p className="text-gray-600">Edite as informações do modelo</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Combobox de Marcas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Marca</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowBrands(!showBrands)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              >
                <span className={formData.brand ? "text-foreground" : "text-muted-foreground"}>
                  {formData.brand || "Selecione uma marca"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              
              {showBrands && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => selectBrand(brand)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input do Nome do Modelo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Modelo</label>
            <Input
              placeholder="Ex: iPhone 15, Galaxy S24, Redmi Note 13"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              disabled={isSaving}
              required
            />
            <p className="text-xs text-gray-500">
              Digite o nome completo do modelo. Ex: iPhone 15 Pro Max
            </p>
          </div>

          {/* Preview do modelo completo */}
          {formData.brand && formData.model.trim() && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Preview do modelo:</label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="font-medium">{formData.brand} {formData.model.trim()}</span>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/models")}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.brand || !formData.model.trim()}
              className="flex-1"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
