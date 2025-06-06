const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginResponse {
  token: string;
  user: {
    // Ajuste aqui conforme o shape do seu user
    _id: string;
    email: string;
    companyId: string;
    roleId: string;
    // outros campos...
  };
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return {
      token: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: null as any,
      error: errorData.error || "Erro ao fazer login",
    };
  }

  const data = await response.json();
  return data;
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function getUser(): Promise<any[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");
  
    const res = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) throw new Error("Erro ao buscar");
    return res.json();
  }

  export async function logout(): Promise<any[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");
  
    const res = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) throw new Error("Erro ao buscar");
    return res.json();
  }

