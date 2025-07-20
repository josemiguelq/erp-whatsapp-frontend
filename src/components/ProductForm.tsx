"use client";

import { useState, useEffect } from "react";
import { Trash, Copy, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { searchModels, createModel, Model } from "@/api/models";

import { Variation, ProductFormData } from "@/types/product";

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  submitButtonText: string;
  title: string;
  isLoading?: boolean;
}

export default function ProductForm({ 
  initialData, 
  onSubmit, 
  submitButtonText, 
  title,
  isLoading = false 
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    model: initialData?.model || "",
    type: initialData?.type || "",
    brand: initialData?.brand || "",
    stock: initialData?.stock || "",
    notes: initialData?.notes || "",
  });

  const [compatibleDevices, setCompatibleDevices] = useState<string[]>(initialData?.compatible_devices || []);
  const [newCompatibleDevice, setNewCompatibleDevice] = useState("");

  const [variations, setVariations] = useState<Variation[]>(initialData?.variations || []);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [samePriceForAll, setSamePriceForAll] = useState(false);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  
  // Estados para busca de dispositivos compatíveis
  const [compatibleDeviceSuggestions, setCompatibleDeviceSuggestions] = useState<Model[]>([]);
  const [showCompatibleDeviceSuggestions, setShowCompatibleDeviceSuggestions] = useState(false);
  const [isSearchingCompatibleDevices, setIsSearchingCompatibleDevices] = useState(false);

  const categories = [
    "Bateria",
    "Touch/Display",
    "Cabo",
    "Carregador",
    "Capinha",
    "Película",
    "Fone de Ouvido",
    "Alto-falante",
    "Microfone",
    "Câmera",
    "Placa Mãe",
    "Outros"
  ];

  const brands = [
    "Apple",
    "Samsung",
    "Xiaomi", 
    "Motorola"
  ];

  useEffect(() => {
    if (formData.type || formData.model || formData.brand) {
      const parts = [formData.type, formData.brand, formData.model].filter(Boolean);
      const suggestedName = parts.join(" ");
      setFormData((prev) => ({ ...prev, name: suggestedName }));
    }
  }, [formData.type, formData.model, formData.brand]);

  useEffect(() => {
    if (initialData) {
      const productType = initialData.type || "";
      
      setFormData({
        name: initialData.name || "",
        model: initialData.model || "",
        type: productType,
        brand: initialData.brand || "",
        stock: initialData.stock || "",
        notes: initialData.notes || "",
      });

      // Verificar se a categoria é personalizada
      if (productType && !categories.slice(0, -1).includes(productType)) {
        setShowCustomCategory(true);
        setCustomCategory(productType);
      }

      setVariations(initialData.variations || []);
      setCompatibleDevices(initialData.compatible_devices || []);
    }
  }, [initialData]);

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

  const handlePriceChange = (index: number, newPrice: number | "") => {
    setVariations((old) => {
      const copy = [...old];
      copy[index].price = newPrice;
      
      // Se mesmo preço para todos estiver ativado e for mudança no primeiro item
      if (samePriceForAll && index === 0 && newPrice !== "") {
        copy.forEach((variation, i) => {
          if (i !== 0) {
            variation.price = newPrice;
          }
        });
      }
      
      return copy;
    });
  };

  const applyFirstPriceToAll = () => {
    if (variations.length > 0 && variations[0].price !== "") {
      const firstPrice = variations[0].price;
      setVariations((old) => 
        old.map(variation => ({ ...variation, price: firstPrice }))
      );
      setSamePriceForAll(true);
    }
  };

  const handleSamePriceToggle = (checked: boolean) => {
    setSamePriceForAll(checked);
    
    if (checked && variations.length > 0 && variations[0].price !== "") {
      // Aplicar o primeiro preço para todas as variações
      const firstPrice = variations[0].price;
      setVariations((old) => 
        old.map(variation => ({ ...variation, price: firstPrice }))
      );
    } else if (!checked) {
      // Limpar os preços das outras variações (manter apenas o primeiro)
      setVariations((old) => 
        old.map((variation, i) => 
          i === 0 ? variation : { ...variation, price: "" }
        )
      );
    }
  };

  const handleBrandChange = (value: string) => {
    setFormData({ ...formData, brand: value });
    
    if (value) {
      const filtered = brands.filter(brand => 
        brand.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBrands(filtered);
      setShowBrandSuggestions(filtered.length > 0 && !brands.includes(value));
    } else {
      setFilteredBrands([]);
      setShowBrandSuggestions(false);
    }
  };

  const selectBrand = (brand: string) => {
    setFormData({ ...formData, brand });
    setShowBrandSuggestions(false);
    setFilteredBrands([]);
  };

  const handleCompatibleDeviceSearch = async (value: string) => {
    setNewCompatibleDevice(value);
    
    if (value.length >= 2) {
      setIsSearchingCompatibleDevices(true);
      try {
        const token = localStorage.getItem("token");
        const models = await searchModels(value, token);
        setCompatibleDeviceSuggestions(models);
        setShowCompatibleDeviceSuggestions(models.length > 0);
      } catch (error) {
        console.error("Erro ao buscar dispositivos:", error);
      } finally {
        setIsSearchingCompatibleDevices(false);
      }
    } else {
      setShowCompatibleDeviceSuggestions(false);
      setCompatibleDeviceSuggestions([]);
    }
  };

  const selectCompatibleDevice = (model: Model) => {
    const deviceName = `${model.brand} ${model.model}`;
    if (!compatibleDevices.includes(deviceName)) {
      setCompatibleDevices([...compatibleDevices, deviceName]);
    }
    setNewCompatibleDevice("");
    setShowCompatibleDeviceSuggestions(false);
    setCompatibleDeviceSuggestions([]);
  };

  const addCompatibleDevice = () => {
    if (newCompatibleDevice.trim() && !compatibleDevices.includes(newCompatibleDevice.trim())) {
      setCompatibleDevices([...compatibleDevices, newCompatibleDevice.trim()]);
      setNewCompatibleDevice("");
    }
  };

  const handleCreateNewCompatibleDevice = async () => {
    if (!newCompatibleDevice.trim()) {
      alert("Por favor, digite um dispositivo compatível");
      return;
    }

    // Extrair marca e modelo do dispositivo (assumindo formato "Marca Modelo")
    const parts = newCompatibleDevice.trim().split(" ");
    if (parts.length < 2) {
      alert("Por favor, digite no formato 'Marca Modelo' (ex: Apple iPhone 12)");
      return;
    }

    const brand = parts[0];
    const model = parts.slice(1).join(" ");

    try {
      const token = localStorage.getItem("token");
      await createModel(brand, model, token);
      
      // Adicionar à lista de dispositivos compatíveis
      const deviceName = `${brand} ${model}`;
      if (!compatibleDevices.includes(deviceName)) {
        setCompatibleDevices([...compatibleDevices, deviceName]);
      }
      setNewCompatibleDevice("");
      
      alert("Dispositivo criado e adicionado com sucesso!");
    } catch (error: unknown) {
      console.error("Erro ao criar dispositivo:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar dispositivo";
      alert(errorMessage);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      variations,
      compatible_devices: compatibleDevices,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-none sm:max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none sm:max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <select
              name="type"
              value={showCustomCategory ? "Outros" : (categories.includes(formData.type) ? formData.type : "")}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "Outros") {
                  setShowCustomCategory(true);
                  setFormData({ ...formData, type: customCategory });
                } else {
                  setShowCustomCategory(false);
                  setCustomCategory("");
                  setFormData({ ...formData, type: value });
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            {showCustomCategory && (
              <Input
                placeholder="Digite a categoria personalizada"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setFormData({ ...formData, type: e.target.value });
                }}
              />
            )}
          </div>
          <label className="text-sm font-medium">Nome (Como vai aparecer na lista de produtos)</label>
          <Input
            name="name"
            placeholder="Nome do produto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Marca</label>
            <Input
              name="brand"
              placeholder="Digite a marca da peça"
              value={formData.brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              onFocus={() => {
                if (formData.brand) {
                  const filtered = brands.filter(brand => 
                    brand.toLowerCase().includes(formData.brand.toLowerCase())
                  );
                  setFilteredBrands(filtered);
                  setShowBrandSuggestions(filtered.length > 0 && !brands.includes(formData.brand));
                }
              }}
              onBlur={() => {
                // Delay para permitir clique nas sugestões
                setTimeout(() => setShowBrandSuggestions(false), 200);
              }}
            />
            
            {showBrandSuggestions && filteredBrands.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => selectBrand(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className="text-sm font-medium">Modelo</label>
          <Input
            name="model"
            placeholder="Modelo da peça"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
          
          <label className="text-sm font-medium">Estoque</label>
          <Input
            name="stock"
            placeholder="Estoque"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Dispositivos Compatíveis</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Digite para buscar ou criar dispositivo (ex: Apple iPhone 12)"
                  value={newCompatibleDevice}
                  onChange={(e) => handleCompatibleDeviceSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCompatibleDevice();
                    }
                  }}
                  onFocus={() => {
                    if (newCompatibleDevice.length >= 2) {
                      setShowCompatibleDeviceSuggestions(compatibleDeviceSuggestions.length > 0);
                    }
                  }}
                  onBlur={() => {
                    // Delay para permitir clique nas sugestões
                    setTimeout(() => setShowCompatibleDeviceSuggestions(false), 200);
                  }}
                />
                
                {isSearchingCompatibleDevices && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
                
                {showCompatibleDeviceSuggestions && compatibleDeviceSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {compatibleDeviceSuggestions.map((model) => (
                      <button
                        key={model._id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                        onClick={() => selectCompatibleDevice(model)}
                      >
                        <div className="font-medium">{model.brand} {model.model}</div>
                        <div className="text-sm text-gray-500">Clique para adicionar</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                onClick={addCompatibleDevice}
                className="whitespace-nowrap"
              >
                Adicionar
              </Button>
              
              {newCompatibleDevice.trim() && newCompatibleDevice.length >= 2 && compatibleDeviceSuggestions.length === 0 && !isSearchingCompatibleDevices && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateNewCompatibleDevice}
                  className="flex items-center gap-1 whitespace-nowrap"
                  title="Criar novo dispositivo"
                >
                  <Plus size={16} />
                  Criar
                </Button>
              )}
            </div>
            
            {newCompatibleDevice.length >= 2 && compatibleDeviceSuggestions.length === 0 && !isSearchingCompatibleDevices && (
              <div className="text-sm text-gray-500">
                Nenhum dispositivo encontrado. Use o formato "Marca Modelo" e clique em "Criar" para adicionar novo.
              </div>
            )}
            
            {compatibleDevices.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {compatibleDevices.map((device, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {device}
                    <button
                      type="button"
                      onClick={() => {
                        setCompatibleDevices(compatibleDevices.filter((_, i) => i !== index));
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Textarea
            name="notes"
            placeholder="Notas"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Variações</h2>
            
            {variations.length > 1 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="same-price"
                    checked={samePriceForAll}
                    onChange={(e) => handleSamePriceToggle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor="same-price"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Mesmo preço para todos
                  </label>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyFirstPriceToAll}
                  className="flex items-center gap-1"
                  disabled={!variations[0] || variations[0].price === ""}
                >
                  <Copy size={14} />
                  Aplicar primeiro preço
                </Button>
              </div>
            )}
          </div>

          {variations.map((variation, index) => (
            <div key={index} className="space-y-2 mb-4 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Preço"
                    value={variation.price}
                    onChange={(e) => {
                      const newPrice = e.target.value === "" ? "" : Number(e.target.value);
                      handlePriceChange(index, newPrice);
                    }}
                    className={`w-24 ${samePriceForAll && index > 0 ? 'bg-gray-100 text-gray-600' : ''}`}
                    min={0}
                    step="0.01"
                    disabled={samePriceForAll && index > 0}
                  />
                  {samePriceForAll && index > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs">
                      <Copy size={8} />
                    </div>
                  )}
                </div>
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
            {submitButtonText}
          </Button>
        </div>
      </Card>
    </div>
  );
} 