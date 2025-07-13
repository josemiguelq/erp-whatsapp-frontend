export interface DashboardData {
  totalOrders: number;
  totalSales: number;
  topDebtors: Array<{
    _id: string;
    name: string;
    totalDebt: number;
  }>;
  dailySales: Array<{
    date: string;
    amount: number;
  }>;
}

// Mock data for testing
export const mockDashboardData: DashboardData = {
  totalOrders: 42,
  totalSales: 15750.80,
  topDebtors: [
    {
      _id: "1",
      name: "João Silva",
      totalDebt: 2350.00
    },
    {
      _id: "2", 
      name: "Maria Santos",
      totalDebt: 1890.50
    },
    {
      _id: "3",
      name: "Pedro Oliveira", 
      totalDebt: 1245.30
    },
    {
      _id: "4",
      name: "Ana Costa",
      totalDebt: 980.00
    },
    {
      _id: "5",
      name: "Carlos Ferreira",
      totalDebt: 756.75
    }
  ],
  dailySales: [
    { date: "2024-01-01", amount: 450.00 },
    { date: "2024-01-02", amount: 780.50 },
    { date: "2024-01-03", amount: 320.00 },
    { date: "2024-01-04", amount: 0 },
    { date: "2024-01-05", amount: 1250.80 },
    { date: "2024-01-06", amount: 890.30 },
    { date: "2024-01-07", amount: 670.00 },
    { date: "2024-01-08", amount: 1100.00 },
    { date: "2024-01-09", amount: 540.20 },
    { date: "2024-01-10", amount: 380.00 },
    { date: "2024-01-11", amount: 920.50 },
    { date: "2024-01-12", amount: 0 },
    { date: "2024-01-13", amount: 1350.00 },
    { date: "2024-01-14", amount: 460.80 },
    { date: "2024-01-15", amount: 720.00 },
    { date: "2024-01-16", amount: 890.00 },
    { date: "2024-01-17", amount: 1020.50 },
    { date: "2024-01-18", amount: 640.30 },
    { date: "2024-01-19", amount: 0 },
    { date: "2024-01-20", amount: 850.00 },
    { date: "2024-01-21", amount: 1180.75 },
    { date: "2024-01-22", amount: 420.00 },
    { date: "2024-01-23", amount: 960.50 },
    { date: "2024-01-24", amount: 710.20 },
    { date: "2024-01-25", amount: 1340.00 },
    { date: "2024-01-26", amount: 580.30 },
    { date: "2024-01-27", amount: 0 },
    { date: "2024-01-28", amount: 990.80 },
    { date: "2024-01-29", amount: 1120.00 },
    { date: "2024-01-30", amount: 875.50 }
  ]
};

export async function fetchDashboardData(token: string | null): Promise<DashboardData> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/api/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar dados do dashboard");
  console.log(res.json());
  return mockDashboardData;
}
