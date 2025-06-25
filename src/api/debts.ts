export async function createDebt(debt:any, token: string|null): Promise<any> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${API_URL}/api/debts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(debt),
    });
    if (!res.ok) throw new Error("Erro ao criar divida");
    return res.json();
  }

  export async function listDebt(debt:any, token: string|null): Promise<any> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${API_URL}/api/debts/list`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });
    if (!res.ok) throw new Error("Erro ao listar");
    return res.json();
  }

  export async function listPaginatedCustomerDebts(customerId: string, page = 1, token: string | null) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/api/debts/customer/${customerId}/list?page=${page}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao listar dívidas do cliente");

  return res.json(); // { data, page, totalPages }
}
