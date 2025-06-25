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
