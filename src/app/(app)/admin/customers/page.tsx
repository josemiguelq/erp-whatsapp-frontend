"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  company?: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      }
    };
    load();
  }, []);

  const openSidebar = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSidebarOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Clientes</h1>
        <Button onClick={() => router.push("/admin/customers/new")}>
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      <Card className="p-4">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Telefone</th>
                <th className="p-2 text-left">Empresa</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.phone || "-"}</td>
                  <td className="p-2">{c.company || "-"}</td>
                  <td className="p-2">
                    <Button onClick={() => openSidebar(c)} size="sm">
                      Ver detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px]">
          <SheetHeader>
            <SheetTitle>{selectedCustomer?.name || "Detalhes do Cliente"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>ID:</strong> {selectedCustomer?.id}</p>
            <p><strong>Telefone:</strong> {selectedCustomer?.phone || "Não informado"}</p>
            <p><strong>Empresa:</strong> {selectedCustomer?.company || "Não informada"}</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
