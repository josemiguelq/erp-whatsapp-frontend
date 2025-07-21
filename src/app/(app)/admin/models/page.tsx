"use client";

import { useEffect, useState } from "react";
import { fetchModels, Model, PaginationData } from "@/api/models";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Package, Plus, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Filtros
  const [brandFilter, setBrandFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  
  // Paginação
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const loadModels = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await fetchModels(token, {
        page,
        limit: pagination.limit,
        brand: brandFilter || undefined,
        name: nameFilter || undefined
      });
      
      setModels(data.models);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar modelos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadModels(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadModels(newPage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Modelos</h1>
          <p className="text-gray-600">Gerencie os modelos de dispositivos cadastrados</p>
        </div>
        <Link href="/admin/models/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Novo Modelo
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Filtrar por marca..."
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Filtrar por nome/modelo..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search size={18} />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Lista de Modelos */}
      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando...</div>
          </div>
        ) : (
          <>
            {models.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Package size={48} className="mb-4" />
                <h3 className="text-lg font-medium">Nenhum modelo encontrado</h3>
                <p>Ajuste os filtros ou adicione novos modelos</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block w-full overflow-x-auto">
                  <table className="min-w-full border rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Marca</th>
                        <th className="p-2 text-left">Modelo</th>
                        <th className="p-2 text-left">Criado em</th>
                        <th className="p-2 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((model) => {
                        const createdDate = new Date(model.createdAt);
                        const formattedDate = createdDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <tr key={model._id} className="border-t hover:bg-gray-50">
                            <td className="p-2 font-medium">{model.brand}</td>
                            <td className="p-2">{model.model}</td>
                            <td className="p-2 text-xs text-gray-500">{formattedDate}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => router.push(`/admin/models/${model._id}/edit`)} 
                                  size="sm" 
                                  variant="outline"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {models.map((model) => {
                    const createdDate = new Date(model.createdAt);
                    const formattedDate = createdDate.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={model._id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{model.brand}</h3>
                            <p className="text-sm text-gray-600">{model.model}</p>
                            <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => router.push(`/admin/models/${model._id}/edit`)} 
                              size="sm" 
                              variant="outline"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </Card>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {models.length} de {pagination.totalCount} modelos (Página {pagination.currentPage} de {pagination.totalPages})
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1"
              >
                Próximo
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 