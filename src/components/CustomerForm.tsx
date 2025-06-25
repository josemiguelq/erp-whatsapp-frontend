"use client"
import { useState } from "react";
import { createCustomer } from "@/api/customers";

interface CustomerFormProps {
  onCreated: (customer: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function CustomerForm({ onCreated, onCancel }: CustomerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token")
    const res = await createCustomer({name, phone}, token)

    const data = await res.id;
    if (res.ok) {
      onCreated({ id: data, name });
    } else {
      alert(data.error || "Erro ao criar cliente");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Novo Cliente</h2>
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Nome"
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="tel"
        className="border p-2 w-full"
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 border">
          Cancelar
        </button>
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
          Criar
        </button>
      </div>
    </form>
  );
}
