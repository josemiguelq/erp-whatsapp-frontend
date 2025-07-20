const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface StoreProduct {
  _id: string;
  model: string;
  name?: string;
  type: string;
  brand: string;
  variations?: Array<{
    price: number;
    description: string;
    images?: string[];
  }>;
  compatible_devices?: string[];
  notes?: string;
}

export interface StorePaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FetchStoreProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface StoreProductsResponse {
  products: StoreProduct[];
  pagination: StorePaginationData;
  filters: {
    category: string | null;
    search: string | null;
  };
}

export async function fetchStoreProducts(params: FetchStoreProductsParams = {}): Promise<StoreProductsResponse> {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/store/products${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error("Erro ao buscar produtos da loja");
  return res.json();
} 