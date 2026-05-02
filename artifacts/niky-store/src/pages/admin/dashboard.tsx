import { useGetAdminStats, useGetRecentOrders, useGetTopProducts, useGetMonthlyRevenue } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();
  const { data: recentOrders } = useGetRecentOrders({ limit: 5 });
  const { data: topProducts } = useGetTopProducts({ limit: 5 });
  const { data: monthlyRevenue } = useGetMonthlyRevenue();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Store performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          title="Total Revenue"
          value={stats ? formatPrice(stats.totalRevenue) : "—"}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
          trend={stats?.revenueChange}
        />
        <KpiCard
          title="Total Orders"
          value={stats?.totalOrders?.toString() ?? "—"}
          icon={<ShoppingCart className="w-5 h-5 text-accent" />}
          trend={stats?.ordersChange}
        />
        <KpiCard
          title="Products"
          value={stats?.totalProducts?.toString() ?? "—"}
          icon={<ShoppingBag className="w-5 h-5 text-accent" />}
        />
        <KpiCard
          title="Customers"
          value={stats?.totalCustomers?.toString() ?? "—"}
          icon={<Users className="w-5 h-5 text-accent" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-sm">Monthly Revenue (PKR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", background: "hsl(var(--card))" }}
                      formatter={(value: number) => [formatPrice(value), "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "hsl(var(--accent))" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-sm">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts?.map((product: any, i: number) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className="w-10 h-10 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.salesCount} sold</p>
                </div>
                <div className="font-bold text-sm text-right text-accent whitespace-nowrap">
                  {formatPrice(product.revenue)}
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display uppercase tracking-wider text-sm">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-xs font-bold text-accent hover:underline uppercase tracking-wider">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                  <th className="px-6 py-3 text-left font-medium">Order</th>
                  <th className="px-6 py-3 text-left font-medium">Customer</th>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-accent">
                      {(order as any).orderNumber || `#${order.id.toString().padStart(6, "0")}`}
                    </td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${STATUS_COLORS[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">{formatPrice(order.total)}</td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground text-sm">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend?: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">{icon}</div>
        </div>
        <div className="font-display font-bold text-2xl tracking-tight">{value}</div>
        {trend !== undefined && (
          <p className={`text-xs flex items-center mt-2 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            <span className="font-semibold">{Math.abs(trend)}%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
