const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Prompt {
  type: string;
  content: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromptData {
  type: string;
  content: string;
  description?: string;
}

export interface UpdatePromptData {
  content: string;
  description?: string;
}

export interface PromptResponse {
  message: string;
  id?: string;
}

// Listar todos os prompts
export async function fetchPrompts(): Promise<Prompt[]> {
  const response = await fetch(`${API_URL}/api/prompts`);
  if (!response.ok) throw new Error("Erro ao buscar prompts");
  return response.json();
}

// Buscar prompt por tipo
export async function fetchPromptByType(type: string): Promise<Prompt> {
  const response = await fetch(`${API_URL}/api/prompts/${type}`);
  if (!response.ok) throw new Error("Erro ao buscar prompt");
  return response.json();
}

// Criar novo prompt
export async function createPrompt(data: CreatePromptData): Promise<PromptResponse> {
  const response = await fetch(`${API_URL}/api/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao criar prompt");
  }
  
  return response.json();
}

// Atualizar prompt
export async function updatePrompt(type: string, data: UpdatePromptData): Promise<PromptResponse> {
  const response = await fetch(`${API_URL}/api/prompts/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao atualizar prompt");
  }
  
  return response.json();
}

// Deletar prompt
export async function deletePrompt(type: string): Promise<PromptResponse> {
  const response = await fetch(`${API_URL}/api/prompts/${type}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao deletar prompt");
  }
  
  return response.json();
} 