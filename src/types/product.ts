export interface Variation {
  price: number | "";
  description: string;
  images: string[];
  showUrlInput?: boolean;
  tempImageUrl?: string;
}

export interface ProductFormData {
  name: string;
  model: string;
  type: string;
  brand: string;
  stock: string;
  notes: string;
  variations: Variation[];
  compatible_devices: string[];
} 