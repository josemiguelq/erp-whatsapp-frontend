"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, deleteProduct } from "@/api/products";
import { searchModels, type Model } from "@/api/models";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import { categories } from "@/types/product";

type Product = {
  _id: string;
  model: string;
  type: string;
  brand: string;
  name?: string;
  type_labels?: string[];
  stock?: string;
  related_products?: string[];
  related_models?: string[];
  compatible_devices?: string[];
  variations?: { price: number; description: string; images?: string[] }[];
  notes?: string;
};

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [compatibleDevicesFilter, setCompatibleDevicesFilter] = useState<string[]>([]);
  
  // Busca de dispositivos compatíveis
  const [newCompatibleDeviceSearch, setNewCompatibleDeviceSearch] = useState("");
  const [compatibleDeviceSuggestions, setCompatibleDeviceSuggestions] = useState<Model[]>([]);
  const [showCompatibleDeviceSuggestions, setShowCompatibleDeviceSuggestions] = useState(false);
  const [isSearchingCompatibleDevices, setIsSearchingCompatibleDevices] = useState(false);
  
  // Paginação
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  const router = useRouter();
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await fetchProducts(token, {
        page,
        limit: pagination.limit,
        category: categoryFilter || undefined,
        name: nameFilter || undefined,
        compatible_devices: compatibleDevicesFilter.length > 0 ? compatibleDevicesFilter.join(',') : undefined
      });
      
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadProducts(newPage);
    }
  };

  // Função para buscar dispositivos compatíveis (similar ao ProductForm)
  const handleCompatibleDeviceSearch = async (value: string) => {
    setNewCompatibleDeviceSearch(value);
    
    if (value.length < 2) {
      setCompatibleDeviceSuggestions([]);
      setShowCompatibleDeviceSuggestions(false);
      return;
    }

    setIsSearchingCompatibleDevices(true);
    try {
      const token = localStorage.getItem("token");
      const models = await searchModels(value, token);
      setCompatibleDeviceSuggestions(models);
      setShowCompatibleDeviceSuggestions(models.length > 0);
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
      setCompatibleDeviceSuggestions([]);
      setShowCompatibleDeviceSuggestions(false);
    } finally {
      setIsSearchingCompatibleDevices(false);
    }
  };

  const selectCompatibleDevice = (model: Model) => {
    const deviceKey = `${model.brand} ${model.model}`;
    if (!compatibleDevicesFilter.includes(deviceKey)) {
      setCompatibleDevicesFilter([...compatibleDevicesFilter, deviceKey]);
    }
    setNewCompatibleDeviceSearch("");
    setCompatibleDeviceSuggestions([]);
    setShowCompatibleDeviceSuggestions(false);
  };

  const addCompatibleDeviceFilter = () => {
    const deviceKey = newCompatibleDeviceSearch.trim();
    if (deviceKey && !compatibleDevicesFilter.includes(deviceKey)) {
      setCompatibleDevicesFilter([...compatibleDevicesFilter, deviceKey]);
      setNewCompatibleDeviceSearch("");
      setCompatibleDeviceSuggestions([]);
      setShowCompatibleDeviceSuggestions(false);
    }
  };

  const removeCompatibleDeviceFilter = (deviceKey: string) => {
    setCompatibleDevicesFilter(compatibleDevicesFilter.filter(device => device !== deviceKey));
  };

  const openSidebar = (product: Product) => {
    setSelectedProduct(product);
    setSidebarOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productModel: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja deletar o produto "${productModel}"?`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await deleteProduct(productId, token);
      
      // Fechar sidebar se o produto deletado estava sendo visualizado
      if (selectedProduct?._id === productId) {
        setSidebarOpen(false);
        setSelectedProduct(null);
      }
      
      // Recarregar a página atual
      loadProducts(pagination.currentPage);
      
      alert("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto. Tente novamente.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Produtos</h1>
        <Button onClick={() => router.push("/admin/products/new")} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Buscar por nome/modelo</label>
            <Input
              placeholder="Digite o nome ou modelo do produto"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <span className={categoryFilter ? "text-foreground" : "text-muted-foreground"}>
                  {categoryFilter || "Todas as categorias"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("");
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm border-b"
                  >
                    Todas as categorias
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(category);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Dispositivos Compatíveis</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Digite para buscar dispositivo (ex: Apple iPhone 12)"
                  value={newCompatibleDeviceSearch}
                  onChange={(e) => handleCompatibleDeviceSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCompatibleDeviceFilter();
                    }
                  }}
                  onFocus={() => {
                    if (newCompatibleDeviceSearch.length >= 2) {
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
                onClick={addCompatibleDeviceFilter}
                className="whitespace-nowrap"
              >
                Adicionar
              </Button>
            </div>
            
            {/* Mostrar dispositivos selecionados */}
            {compatibleDevicesFilter.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {compatibleDevicesFilter.map((device, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {device}
                    <button
                      type="button"
                      onClick={() => removeCompatibleDeviceFilter(device)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 lg:flex-col lg:justify-end">
            <Button onClick={handleSearch} className="flex items-center gap-2 w-full lg:w-auto" disabled={loading}>
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setNameFilter("");
                setCategoryFilter("");
                setCompatibleDevicesFilter([]);
                setNewCompatibleDeviceSearch("");
                setCompatibleDeviceSuggestions([]);
                setShowCategoryDropdown(false);
                setShowCompatibleDeviceSuggestions(false);
                setTimeout(() => loadProducts(1), 100);
              }}
              disabled={loading}
              className="w-full lg:w-auto"
            >
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Status dos resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {loading ? (
            "Carregando produtos..."
          ) : (
            `Mostrando ${products.length} de ${pagination.totalCount} produtos`
          )}
        </div>
      </Card>

      <Card className="p-2 sm:p-4">
        {/* Desktop Table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Carregando produtos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.type}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button onClick={() => openSidebar(p)} size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => router.push(`/admin/products/${p._id}/edit`)} size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteProduct(p._id, p.model)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum produto encontrado
            </div>
          ) : (
            products.map((p, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-sm text-gray-600">{p.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openSidebar(p)} size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => router.push(`/admin/products/${p._id}/edit`)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteProduct(p._id, p.model)} 
                      size="sm" 
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              {/* Números das páginas */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, pagination.currentPage - 2) + i;
                  if (pageNumber > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[450px] md:w-[550px] max-w-[90vw] md:max-w-[50vw] overflow-y-auto p-6">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-left text-lg font-semibold">
              {selectedProduct?.name || selectedProduct?.model || "Detalhes do Produto"}
            </SheetTitle>
            <p className="text-sm text-gray-500 text-left">
              ID: {selectedProduct?._id}
            </p>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Modelo:</span>
                  <span className="text-sm text-gray-900">{selectedProduct?.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Categoria:</span>
                  <span className="text-sm text-gray-900">{selectedProduct?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Marca:</span>
                  <span className="text-sm text-gray-900">{selectedProduct?.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Estoque:</span>
                  <span className="text-sm text-gray-900">{selectedProduct?.stock || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Dispositivos Compatíveis */}
            {selectedProduct?.compatible_devices && selectedProduct.compatible_devices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Dispositivos Compatíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.compatible_devices.map((device, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {device}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Variações */}
            {selectedProduct?.variations && selectedProduct.variations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Variações</h3>
                <div className="space-y-3">
                  {selectedProduct.variations.map((variation, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {variation.description}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          R$ {typeof variation.price === 'number' ? variation.price.toFixed(2) : variation.price}
                        </span>
                      </div>
                      {variation.images && variation.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {variation.images.slice(0, 3).map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt={`Imagem ${imgIndex + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ))}
                          {variation.images.length > 3 && (
                            <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{variation.images.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relacionamentos */}
            {((selectedProduct?.related_models && selectedProduct.related_models.length > 0) ||
              (selectedProduct?.related_products && selectedProduct.related_products.length > 0) ||
              (selectedProduct?.type_labels && selectedProduct.type_labels.length > 0)) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Relacionamentos</h3>
                
                {selectedProduct?.type_labels && selectedProduct.type_labels.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Etiquetas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProduct.type_labels.map((label, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct?.related_models && selectedProduct.related_models.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Modelos Relacionados:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedProduct.related_models.map((model, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {model}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedProduct?.related_products && selectedProduct.related_products.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Produtos Relacionados:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedProduct.related_products.map((product, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {product}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            {selectedProduct?.notes && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Observações</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <p className="text-sm text-gray-700">{selectedProduct.notes}</p>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push(`/admin/products/${selectedProduct?._id}/edit`)} 
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => selectedProduct && handleDeleteProduct(selectedProduct._id, selectedProduct.model)} 
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
