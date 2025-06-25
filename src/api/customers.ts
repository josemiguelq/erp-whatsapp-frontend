// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCustomer(customer:any, token: string|null): Promise<any> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
    console.log('customer', customer)
    const res = await fetch(`${API_URL}/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customer),
    });
    if (!res.ok) throw new Error("Erro ao criar customer");
    return res.json();
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchByName(name: string, token: string | null): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const query = new URLSearchParams({ name }).toString();
  const res = await fetch(`${API_URL}/api/customers/search?${query}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar customer");

  return res.json();
}