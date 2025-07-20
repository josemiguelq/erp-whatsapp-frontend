"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createModel } from "@/api/models";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function NewModelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: "",
    modelName: "",
  });
  
  const [showBrands, setShowBrands] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Marcas principais hardcoded
  const brands = [
    "Apple",
    "Samsung", 
    "Motorola",
    "LG",
    "Huawei",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Realme",    
    "Sony",
    "Nokia",
    "Google",
    "Xiaomi",
    "Nothing"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.modelName.trim()) {
      alert("Por favor, selecione uma marca e digite o nome do modelo");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Concatenar marca + nome para criar o modelo completo
      const fullModelName = `${formData.brand} ${formData.modelName.trim()}`;
      
      await createModel(formData.brand, fullModelName, token);
      
      alert("Modelo criado com sucesso!");
      router.push("/admin/models");
    } catch (error: unknown) {
      console.error("Erro ao criar modelo:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar modelo";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectBrand = (brand: string) => {
    setFormData({ ...formData, brand });
    setShowBrands(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Novo Modelo</h1>
        <p className="text-gray-600">Cadastre um novo modelo de dispositivo</p>
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
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              Digite apenas o nome do modelo. A marca será adicionada automaticamente.
            </p>
          </div>

          {/* Preview do modelo completo */}
          {formData.brand && formData.modelName.trim() && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Preview do modelo completo:</label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="font-medium">{formData.brand} {formData.modelName.trim()}</span>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/models")}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.brand || !formData.modelName.trim()}
              className="flex-1"
            >
              {isLoading ? "Criando..." : "Criar Modelo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
