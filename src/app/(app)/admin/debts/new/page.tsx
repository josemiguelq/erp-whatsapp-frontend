"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CustomerForm } from "@/components/CustomerForm"; // Reutilizável
import { Plus } from "lucide-react";
import { createDebt } from "@/api/debts";
import {searchByName} from '@/api/customers'


type Customer = {
  id: string;
  name: string;
};

export default function DebtRegisterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [retrievedBy, setRetrievedBy] = useState("");
  const [retrievedByOwner, setRetrievedByOwner] = useState(false);
  const [soldBy, setSoldBy] = useState("Julielinton");
  const [items, setItems] = useState<Item[]>([{ name: "", price: 0 }]);

  useEffect(() => {
    fetch("/api/customers/search")
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  useEffect(() => {
    if (retrievedByOwner && selectedCustomer) {
      setRetrievedBy(selectedCustomer.name);
    }
  }, [retrievedByOwner, selectedCustomer]);

  type Item = {
  name: string;
  price: number;
};

  const handleItemChange = <K extends keyof Item>(
  index: number,
  field: K,
  value: string
) => {
  const newItems = [...items];
  newItems[index][field] = field === "price"
    ? (parseFloat(value) || 0) as Item[K]
    : (value as Item[K]);

  setItems(newItems);
};


  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Registrar Dívida</h1>
        <div className="text-right space-y-1">
          <p className="text-xl">Total da dívida: <span className="text-red-600">R$ {total.toFixed(2)}</span></p>
          {selectedCustomer && (
            <div className="text-sm text-gray-600">
              <p>Últimos pedidos de {selectedCustomer.name}:</p>
              <ul className="list-disc ml-5">
                <li>01/06 - R$ 120,00</li>
                <li>18/05 - R$ 80,00</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <Card className="p-4 space-y-4">
        {/* Customer selector */}
        <div className="space-y-2">
  <Label>Cliente</Label>
  <div className="flex gap-2">
    <Input
      list="customers"
      placeholder="Buscar por nome"
      onChange={async (e) => {
        const query = e.target.value.trim();
        if (!query) return setCustomers([]);

        try {
          const token = localStorage.getItem("token");
          const results = await searchByName(query, token);
          setCustomers(results);

          const exact = results.find((c: Customer) => c.name.toLowerCase() === query.toLowerCase());
          if (exact) setSelectedCustomer(exact);
        } catch (err) {
          console.error("Erro na busca de cliente:", err);
        }
      }}
    />
    <datalist id="customers">
      {customers.map(c => (
        <option key={c.id} value={c.name} />
      ))}
    </datalist>

    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CustomerForm
          onCancel={() => {}}
          onCreated={(customer) => {
            setCustomers(prev => [...prev, customer]);
            setSelectedCustomer(customer);
          }}
        />
      </DialogContent>
    </Dialog>
  </div>
</div>

        {/* Retirado por */}
        <div className="space-y-1">
          <Label>Retirado por</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="retrievedByOwner"
              checked={retrievedByOwner}
              onCheckedChange={(v) => setRetrievedByOwner(Boolean(v))}
            />
            <Label htmlFor="retrievedByOwner">Retirado pelo Dono?</Label>
          </div>
          <Input
            value={retrievedBy}
            onChange={(e) => setRetrievedBy(e.target.value)}
            placeholder="Nome da pessoa que retirou"
          />
        </div>

        {/* Vendido por */}
        <div className="space-y-1">
          <Label>Vendido por</Label>
          <select
            className="border p-2 rounded w-full"
            value={soldBy}
            onChange={(e) => setSoldBy(e.target.value)}
          >
            <option value="Julielinton">Julielinton</option>
            <option value="Joel">Joel</option>
          </select>
        </div>

        {/* Itens da dívida */}
        <div className="space-y-2">
          <Label>Peças</Label>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Nome da peça"
                value={item.name}
                onChange={(e) => handleItemChange(idx, "name", e.target.value)}
              />
              <Input
                placeholder="Preço"
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
              />
            </div>
          ))}
          <Button variant="outline" onClick={() => setItems([...items, { name: "", price: 0 }])}>
            + Adicionar peça
          </Button>
        </div>

        {/* Enviar */}
        <Button
  className="mt-4"
  onClick={async () => {
    if (!selectedCustomer) {
      alert("Selecione um cliente primeiro");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        customerId: selectedCustomer.id,
        retrievedBy,
        soldBy,
        items,
        total,
      };

      const response = await createDebt(payload, token);
      console.log("Dívida registrada:", response);
      alert("Dívida registrada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar dívida");
    }
  }}
>
  Registrar Dívida
</Button>

      </Card>
    </div>
  );
}
