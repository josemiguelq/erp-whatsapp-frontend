"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";
import { TrendingUp, Users, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const dashboardData = await fetchDashboardData(token);
        setData(dashboardData);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold">{data.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total Vendido</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalSales)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clientes Devedores</p>
              <p className="text-2xl font-bold">{data.topDebtors.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendas Últimos 7 dias</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  data.dailySales.slice(-7).reduce((sum, day) => sum + day.amount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas Diárias */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Vendas Diárias</h2>
          <div className="space-y-3">
            {data.dailySales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-2 gap-4 font-medium text-sm text-gray-600 pb-2 border-b">
                    <span>Data</span>
                    <span className="text-right">Valor</span>
                  </div>
                  <div className="space-y-2 mt-3">
                    {data.dailySales.slice(-10).reverse().map((sale, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4 py-2 hover:bg-gray-50 rounded">
                        <span className="text-sm">{formatDate(sale.date)}</span>
                        <span className="text-sm font-medium text-right">
                          {formatCurrency(sale.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-2">
                  {data.dailySales.slice(-7).reverse().map((sale, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{formatDate(sale.date)}</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(sale.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Clientes que Mais Devem */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Clientes que Mais Devem</h2>
          <div className="space-y-3">
            {data.topDebtors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum devedor registrado</p>
            ) : (
              <>
                {/* Desktop List */}
                <div className="hidden sm:block space-y-3">
                  {data.topDebtors.map((debtor, index) => (
                    <div key={debtor._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-700 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{debtor.name}</p>
                          <p className="text-xs text-gray-600">Cliente</p>
                        </div>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(debtor.totalDebt)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mobile List */}
                <div className="sm:hidden space-y-2">
                  {data.topDebtors.map((debtor, index) => (
                    <div key={debtor._id} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">#{index + 1} {debtor.name}</p>
                          <p className="text-xs text-gray-600">Débito total</p>
                        </div>
                        <span className="font-bold text-red-600 text-sm">
                          {formatCurrency(debtor.totalDebt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
