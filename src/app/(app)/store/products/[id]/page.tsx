"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addToCart(item: any) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function ProductDetailPage() {
  const { id } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      setLoading(true);
      const data = await getProductById(id as string);
      setProduct(data);
      setLoading(false);

      // Define a imagem padrão ao carregar o produto
      const defaultImage = data?.variations?.[0]?.images?.[0] || null;
      setSelectedImage(defaultImage);
    }

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Atualiza a imagem principal ao trocar de variação
    const variationImages = product?.variations?.[selectedVariation]?.images;
    setSelectedImage(variationImages?.[0] || null);
  }, [selectedVariation, product]);

  if (loading) return <p className="p-6">Carregando...</p>;
  if (!product) return <p className="p-6">Produto não encontrado</p>;

  const variation = product.variations?.[selectedVariation];

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      model: product.model,
      variation: variation.description,
      price: variation.price,
      quantity,
    });
    alert("Produto adicionado ao carrinho!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Galeria de imagens */}
        <div className="w-full md:w-1/2 space-y-4">
          <img
            src={selectedImage || "https://via.placeholder.com/400"}
            alt={product.model}
            className="rounded-xl w-full h-[400px] object-cover"
          />

          <div className="flex gap-2 overflow-x-auto">
            {variation.images?.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt={`Imagem ${i + 1}`}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 object-cover border rounded-md cursor-pointer ${
                  selectedImage === img ? "ring-2 ring-blue-500" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Detalhes do produto */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-2xl font-bold">{product.model}</h1>
          <p className="text-gray-600">{product.type}</p>

          {/* Seleção de variação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Opções:</label>
            <div className="flex flex-wrap gap-2">
              {product.variations.map((v: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariation(index)}
                  className={`px-4 py-2 border rounded-full text-sm ${
                    index === selectedVariation
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 border-gray-300"
                  }`}
                >
                  {v.description}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div className="flex items-center gap-2 mt-4">
            <label className="text-sm font-medium">Quantidade:</label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24"
            />
          </div>

          {/* Preço */}
          <p className="text-2xl font-semibold text-green-600">
            R$ {variation?.price.toFixed(2)}
          </p>

          {/* Ações */}
          <div className="flex gap-4 mt-4">
            <Button onClick={handleBuyNow} className="bg-red-600 hover:bg-red-700">
              Comprar agora
            </Button>
            <Button onClick={handleAddToCart} variant="outline">
              Adicionar ao carrinho
            </Button>
          </div>

          {/* Notas */}
          {product.notes && (
            <div className="text-sm text-gray-500 mt-4">
              <p>{product.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
