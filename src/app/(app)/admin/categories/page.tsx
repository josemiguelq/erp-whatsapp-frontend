"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, deleteCategory, type Category } from "@/api/categories";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filtros
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
  
  const router = useRouter();

  const loadCategories = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await fetchCategories(token, {
        page,
        limit: pagination.limit,
        name: nameFilter || undefined
      });
      
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadCategories(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadCategories(newPage);
    }
  };

  const openSidebar = (category: Category) => {
    setSelectedCategory(category);
    setSidebarOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja deletar a categoria "${categoryName}"?`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await deleteCategory(categoryId, token);
      
      // Fechar sidebar se a categoria deletada estava sendo visualizada
      if (selectedCategory?._id === categoryId) {
        setSidebarOpen(false);
        setSelectedCategory(null);
      }
      
      // Recarregar a página atual
      loadCategories(pagination.currentPage);
      
      alert("Categoria deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      alert("Erro ao deletar categoria. Tente novamente.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Categorias</h1>
        <Button onClick={() => router.push("/admin/categories/new")} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Buscar por nome</label>
            <Input
              placeholder="Digite o nome da categoria"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2" disabled={loading}>
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setNameFilter("");
                setTimeout(() => loadCategories(1), 100);
              }}
              disabled={loading}
            >
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Status dos resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {loading ? (
            "Carregando categorias..."
          ) : (
            `Mostrando ${categories.length} de ${pagination.totalCount} categorias`
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
                <th className="p-2 text-left">Sinônimos</th>
                <th className="p-2 text-left">Criado em</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Carregando categorias...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nenhuma categoria encontrada
                  </td>
                </tr>
              ) : (
                categories.map((category, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">{category.name}</td>
                    <td className="p-2">
                      {category.synonyms && category.synonyms.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {category.synonyms.slice(0, 3).map((synonym, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                            >
                              {synonym}
                            </span>
                          ))}
                          {category.synonyms.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{category.synonyms.length - 3} mais
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Nenhum sinônimo</span>
                      )}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button onClick={() => openSidebar(category)} size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => router.push(`/admin/categories/${category._id}/edit`)} size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteCategory(category._id, category.name)} 
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
              Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma categoria encontrada
            </div>
          ) : (
            categories.map((category, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-600">{formatDate(category.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openSidebar(category)} size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => router.push(`/admin/categories/${category._id}/edit`)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteCategory(category._id, category.name)} 
                      size="sm" 
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {category.synonyms && category.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {category.synonyms.slice(0, 3).map((synonym, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                      >
                        {synonym}
                      </span>
                    ))}
                    {category.synonyms.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{category.synonyms.length - 3} mais
                      </span>
                    )}
                  </div>
                )}
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
              {selectedCategory?.name}
            </SheetTitle>
            <p className="text-sm text-gray-500 text-left">
              ID: {selectedCategory?._id}
            </p>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Informações</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Nome:</span>
                  <span className="text-sm text-gray-900">{selectedCategory?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Criado em:</span>
                  <span className="text-sm text-gray-900">
                    {selectedCategory?.createdAt && formatDate(selectedCategory.createdAt)}
                  </span>
                </div>
                {selectedCategory?.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Atualizado em:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(selectedCategory.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sinônimos */}
            {selectedCategory?.synonyms && selectedCategory.synonyms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Sinônimos</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.synonyms.map((synonym, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {synonym}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Os sinônimos ajudam na busca e permitem encontrar esta categoria usando diferentes termos.
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push(`/admin/categories/${selectedCategory?._id}/edit`)} 
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => selectedCategory && handleDeleteCategory(selectedCategory._id, selectedCategory.name)} 
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