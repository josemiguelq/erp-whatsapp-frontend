"use client"

import { useState } from "react";
import { createCustomer } from "@/api/customers";

export default function CustomerRegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    console.log('sasasas')
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const token = localStorage.getItem("token")
    const res = await createCustomer({ name, phone, company }, token)    
    if (res.id) {
      setSuccessMessage("Cliente cadastrado com sucesso!");
      setName("");
      setCompany("");
      setPhone("");
    } else {
      setErrorMessage(res.error || "Erro ao cadastrar cliente.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center">Cadastrar Cliente</h1>

        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nome *</label>
            <input
              type="text"
              className="border border-gray-300 p-2 w-full rounded"
              placeholder="Digite o nome"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Loja *</label>
            <input
              type="text"
              className="border border-gray-300 p-2 w-full rounded"
              placeholder="Digite o nome da Loja"
              value={company}
              required
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Telefone</label>
            <input
              type="tel"
              className="border border-gray-300 p-2 w-full rounded"
              placeholder="Ex: 11999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
