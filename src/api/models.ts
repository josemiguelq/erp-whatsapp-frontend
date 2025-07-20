const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Model {
  _id: string;
  brand: string;
  model: string;
}

export interface ListModelsParams {
  page?: number;
  limit?: number;
  brand?: string;
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

export async function searchModels(searchTerm: string, token: string | null): Promise<Model[]> {
  const res = await fetch(`${API_URL}/api/models/search?q=${encodeURIComponent(searchTerm)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar modelos");
  return res.json();
}

export async function createModel(brand: string, model: string, token: string | null): Promise<Model> {
  const res = await fetch(`${API_URL}/api/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ brand, model }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erro ao criar modelo");
  }
  
  const result = await res.json();
  return result.model;
}

export async function fetchModels(token: string | null, params: ListModelsParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.name) queryParams.append('name', params.name);
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/api/models${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar modelos");
  return res.json();
} 