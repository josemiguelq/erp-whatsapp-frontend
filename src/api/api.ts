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
