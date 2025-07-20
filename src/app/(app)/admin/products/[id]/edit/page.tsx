"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateProduct, getProductById } from "@/api/products";
import ProductForm from "@/components/ProductForm";
import { ProductFormData } from "@/types/product";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [productData, setProductData] = useState<ProductFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const product = await getProductById(productId, token);
        
        setProductData({
          name: product.name || "",
          model: product.model || "",
          type: product.type || "",
          brand: product.brand || "",
          stock: product.stock || "",
          notes: product.notes || "",
          variations: product.variations || [],
          compatible_devices: product.compatible_devices || [],
        });
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
        alert("Erro ao carregar produto");
        router.push("/admin/products");
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  const handleSubmit = async (formData: ProductFormData) => {
    const token = localStorage.getItem("token");
    try {
      await updateProduct(productId, {
        ...formData,
        type_labels: [],
        related_products: [],
        related_models: [],
        compatible_devices: formData.compatible_devices || [],
      }, token);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar produto");
    }
  };

  return (
    <ProductForm
      title="Editar Produto"
      submitButtonText="Salvar Alterações"
      onSubmit={handleSubmit}
      initialData={productData}
      isLoading={loading}
    />
  );
}
