"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listPaginatedCustomerDebts } from "@/api/debts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Debt = {
  _id: string;
  customer: { name: string; company?: string };
  createdAt: string;
  total: number;
  payments: { value: number }[];
  retrievedBy: string;
  soldBy: string;
  items: { name: string; price: number; paid?: boolean }[];
};

export default function CustomerDebtsPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [debts, setDebts] = useState<Debt[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await listPaginatedCustomerDebts(customerId, page, token);
      setDebts(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId, page]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Dívidas do Cliente</h1>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Pago</th>
                <th className="p-2 text-left">Restante</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((debt) => {
                const totalPaid = debt.payments.reduce((sum, p) => sum + p.value, 0);
                const remaining = debt.total - totalPaid;

                return (
                  <tr key={debt._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{new Date(debt.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">R$ {debt.total.toFixed(2)}</td>
                    <td className="p-2 text-green-600">R$ {totalPaid.toFixed(2)}</td>
                    <td className="p-2 text-red-600">R$ {remaining.toFixed(2)}</td>
                    <td className="p-2">
                      <Button size="sm" onClick={() => {
                        setSelectedDebt(debt);
                        setSidebarOpen(true);
                      }}>
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Página Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima Página
          </Button>
        </div>
      </Card>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes da Dívida</SheetTitle>
          </SheetHeader>

          {selectedDebt && (
            <div className="space-y-2 mt-4">
              <p><strong>Data:</strong> {new Date(selectedDebt.createdAt).toLocaleString()}</p>
              <p><strong>Retirado por:</strong> {selectedDebt.retrievedBy}</p>
              <p><strong>Vendido por:</strong> {selectedDebt.soldBy}</p>
              <p><strong>Total:</strong> R$ {selectedDebt.total.toFixed(2)}</p>

              <div>
                <strong>Itens:</strong>
                <ul className="list-disc ml-4">
                  {selectedDebt.items.map((item, i) => (
                    <li key={i}>
                      {item.name} – R$ {item.price.toFixed(2)} {item.paid && "(pago)"}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Pagamentos:</strong>
                {selectedDebt.payments.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum pagamento registrado</p>
                ) : (
                  <ul className="list-disc ml-4">
                    {selectedDebt.payments.map((p, i) => (
                      <li key={i}>R$ {p.value.toFixed(2)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
