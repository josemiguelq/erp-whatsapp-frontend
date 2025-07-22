const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Category {
  _id: string;
  name: string;
  synonyms: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function searchCategories(searchTerm: string, token: string | null): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories/search?q=${encodeURIComponent(searchTerm)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar categorias");
  return res.json();
}

export async function createCategory(name: string, synonyms: string[], token: string | null): Promise<Category> {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, synonyms }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erro ao criar categoria");
  }
  
  const result = await res.json();
  return result.category;
}

export async function getCategoryById(id: string, token: string | null): Promise<Category> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar categoria");
  return res.json();
}

export async function updateCategory(id: string, name: string, synonyms: string[], token: string | null): Promise<Category> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, synonyms }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erro ao atualizar categoria");
  }
  
  const result = await res.json();
  return result.category;
}

export async function deleteCategory(id: string, token: string | null): Promise<void> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erro ao deletar categoria");
  }
}

export async function fetchCategories(token: string | null, params: ListCategoriesParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.name) queryParams.append('name', params.name);
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/api/categories${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar categorias");
  return res.json();
}

export async function fetchAllCategories(token: string | null): Promise<Category[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('limit', '1000'); // Buscar muitas categorias de uma vez
  
  const url = `${API_URL}/api/categories?${queryParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar categorias");
  const data = await res.json();
  return data.categories || [];
} 