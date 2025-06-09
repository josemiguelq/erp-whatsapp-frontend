const API_URL = process.env.NEXT_PUBLIC_API_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchProducts(token: string|null): Promise<any[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
    const res = await fetch(`${API_URL}/api/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    return res.json();
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  export async function createProduct(productData: any, token:string|null) {
    const res = await fetch(`${API_URL}/api/products/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([productData]), // batch API espera um array
    });
  
    if (!res.ok) {
      throw new Error("Erro ao criar produto");
    }
  
    return res.json();
  }

export async function getProductById(id: string, token:string|null) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },});
  return response.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchProducts(q: string, token: string|null): Promise<any[]> {    
  
    console.log(q)
    const res = await fetch(`${API_URL}/api/products/search/pos?q=${q}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    return res.json();
  }