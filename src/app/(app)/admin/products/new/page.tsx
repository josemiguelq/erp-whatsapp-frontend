"use client";

import { useRouter } from "next/navigation";
import { createProduct } from "@/api/products";
import ProductForm from "@/components/ProductForm";
import { ProductFormData } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (formData: ProductFormData) => {
    const token = localStorage.getItem("token");
    try {
      await createProduct({
        ...formData,
        type_labels: [],
        related_products: [],
        related_models: [],
        compatible_devices: formData.compatible_devices || [],
      }, token);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar produto");
    }
  };

  return (
    <ProductForm
      title="Novo Produto"
      submitButtonText="Salvar Produto"
      onSubmit={handleSubmit}
    />
  );
}
