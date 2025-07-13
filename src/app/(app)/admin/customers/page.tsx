"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Eye, ReceiptText  } from "lucide-react";


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
    <div className="p-2 sm:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-xl font-bold">Clientes</h1>
        <Button onClick={() => router.push("/admin/customers/new")} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      <Card className="p-2 sm:p-4">
        {/* Desktop Table */}
        <div className="hidden md:block w-full overflow-x-auto">
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <p className="mb-4">Nenhum cliente encontrado.</p>
                    <Button 
                      onClick={() => router.push("/admin/customers/new")}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Cliente
                    </Button>
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">{c.phone || "-"}</td>
                    <td className="p-2">{c.company || "-"}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openSidebar(c)} 
                          title="Ver detalhes"
                          className="p-1 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/customers/${c.id}/debts`)}
                          title="Ver dívidas"
                          className="p-1 hover:bg-green-50 rounded"
                        >
                          <ReceiptText className="w-5 h-5 text-gray-600 hover:text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum cliente encontrado.</p>
              <Button 
                onClick={() => router.push("/admin/customers/new")}
                className="mt-4"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Cliente
              </Button>
            </div>
          ) : (
            customers.map((c, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-white">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium text-sm">{c.name}</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Telefone:</span> {c.phone || "Não informado"}</p>
                      <p><span className="font-medium">Empresa:</span> {c.company || "Não informada"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => openSidebar(c)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button
                      onClick={() => router.push(`/admin/customers/${c.id}/debts`)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <ReceiptText className="w-4 h-4 mr-2" />
                      Dívidas
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[400px] md:w-[500px] max-w-[90vw] md:max-w-[50vw]">
          <SheetHeader>
            <SheetTitle className="text-left">{selectedCustomer?.name || "Detalhes do Cliente"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <strong className="text-sm font-medium">ID:</strong>
                <p className="text-sm text-gray-600">{selectedCustomer?.id}</p>
              </div>
              <div>
                <strong className="text-sm font-medium">Nome:</strong>
                <p className="text-sm text-gray-600">{selectedCustomer?.name}</p>
              </div>
              <div>
                <strong className="text-sm font-medium">Telefone:</strong>
                <p className="text-sm text-gray-600">{selectedCustomer?.phone || "Não informado"}</p>
              </div>
              <div>
                <strong className="text-sm font-medium">Empresa:</strong>
                <p className="text-sm text-gray-600">{selectedCustomer?.company || "Não informada"}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                onClick={() => {
                  setSidebarOpen(false);
                  if (selectedCustomer) {
                    router.push(`/admin/customers/${selectedCustomer.id}/debts`);
                  }
                }}
                className="w-full"
              >
                <ReceiptText className="w-4 h-4 mr-2" />
                Ver Dívidas do Cliente
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
