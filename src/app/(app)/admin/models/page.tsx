"use client";

import { useEffect, useState } from "react";
import { fetchModels, Model, PaginationData } from "@/api/models";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Package, Plus } from "lucide-react";
import Link from "next/link";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  
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
                {/* Header da tabela */}
                <div className="hidden sm:grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-t-lg font-medium text-gray-700">
                  <div>Marca</div>
                  <div>Modelo</div>
                  <div>ID</div>
                </div>

                {/* Itens da tabela */}
                <div className="divide-y divide-gray-200">
                  {models.map((model) => (
                    <div key={model._id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:block">
                        <span className="text-sm text-gray-500 sm:hidden">Marca:</span>
                        <span className="font-medium">{model.brand}</span>
                      </div>
                      <div className="flex flex-col sm:block">
                        <span className="text-sm text-gray-500 sm:hidden">Modelo:</span>
                        <span>{model.model}</span>
                      </div>
                      <div className="flex flex-col sm:block">
                        <span className="text-sm text-gray-500 sm:hidden">ID:</span>
                        <span className="text-xs text-gray-500 font-mono">{model._id}</span>
                      </div>
                    </div>
                  ))}
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