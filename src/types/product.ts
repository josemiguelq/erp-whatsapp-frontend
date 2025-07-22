export interface Variation {
  price: number | "";
  description: string;
  images: string[];
  showUrlInput?: boolean;
  tempImageUrl?: string;
}

export interface Category {
  _id: string;
  name: string;
  synonyms: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  model: string;
  type: Category | null;
  brand: string;
  stock: string;
  notes: string;
  variations: Variation[];
  compatible_devices: string[];
} 

// Categorias agora são carregadas dinamicamente da API
// Veja /api/categories para gerenciar categorias