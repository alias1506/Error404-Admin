import { useEffect, useState, useCallback } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import Leaderboard from "../../components/ecommerce/Leaderboard";

import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Home() {
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    monthlySales: Array(12).fill(0),
    statistics: Array(12).fill(0),
    revenue: 0,
    target: 0,
    leaderboard: []
  });

  const fetchStats = useCallback(() => {
    fetch(`${API_URL}/api/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchStats]);


  return (
    <>
      <PageMeta
        title="Dashboard | Error404"
        description="Admin Dashboard for Error404"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics customers={stats.customers} orders={stats.orders} />

          <MonthlySalesChart data={stats.monthlySales} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <Leaderboard users={stats.leaderboard} />
        </div>

        <div className="col-span-12">
          <StatisticsChart data={stats.statistics} />
        </div>
      </div>
    </>
  );
}
