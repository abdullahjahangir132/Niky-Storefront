import { useGetAdminStats, useGetRecentOrders, useGetTopProducts, useGetMonthlyRevenue } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  confirmed: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  shipped: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  delivered: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-red-400/25 bg-red-400/10 text-red-300",
};

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();
  const { data: recentOrders } = useGetRecentOrders({ limit: 5 });
  const { data: topProducts } = useGetTopProducts({ limit: 5 });
  const { data: monthlyRevenue } = useGetMonthlyRevenue();

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">NANO / 01</p>
          <h1 className="font-display text-4xl font-black uppercase tracking-[-0.06em] md:text-5xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Store performance overview</p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live business pulse</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="border-border/80 bg-card/80 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-border/70 pb-4">
            <div>
              <CardTitle className="font-display text-sm uppercase tracking-[0.12em]">Monthly Revenue (PKR)</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.12)]" />
          </CardHeader>
          <CardContent className="pt-5">
            <div className="h-[280px]">
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "2px", border: "1px solid hsl(var(--border))", boxShadow: "0 14px 36px rgba(0,0,0,0.35)", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      formatter={(value: number) => [formatPrice(value), "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "hsl(var(--accent))", strokeWidth: 0 }}
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
        <Card className="border-border/80 bg-card/80">
          <CardHeader className="border-b border-border/70 pb-4">
            <CardTitle className="font-display text-sm uppercase tracking-[0.12em]">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {topProducts?.map((product: any, i: number) => (
              <div key={product.id} className="group flex items-center gap-3 border-b border-border/50 py-2 last:border-0">
                <span className="w-5 text-xs font-bold text-muted-foreground">0{i + 1}</span>
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden border border-border bg-secondary p-1">
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.salesCount} sold</p>
                </div>
                <div className="whitespace-nowrap text-right text-sm font-bold text-accent">
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
      <Card className="border-border/80 bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-4">
          <CardTitle className="font-display text-sm uppercase tracking-[0.12em]">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-[0.18em] text-accent transition-colors hover:text-foreground">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-4 text-left font-bold md:px-6">Order</th>
                  <th className="px-5 py-4 text-left font-bold md:px-6">Customer</th>
                  <th className="px-5 py-4 text-left font-bold md:px-6">Date</th>
                  <th className="px-5 py-4 text-left font-bold md:px-6">Status</th>
                  <th className="px-5 py-4 text-right font-bold md:px-6">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders?.map((order: any) => (
                  <tr key={order.id} className="transition-colors hover:bg-white/[0.035]">
                    <td className="px-5 py-4 font-bold text-accent md:px-6">
                      {(order as any).orderNumber || `#${order.id.toString().padStart(6, "0")}`}
                    </td>
                    <td className="px-5 py-4 md:px-6">{order.customerName}</td>
                    <td className="px-5 py-4 text-muted-foreground md:px-6">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-4 md:px-6">
                      <span className={`inline-flex border px-2.5 py-1 text-[10px] font-bold capitalize tracking-wide ${STATUS_COLORS[order.status] || "border-border bg-secondary text-muted-foreground"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold md:px-6">{formatPrice(order.total)}</td>
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
    <Card className="group border-border/80 bg-card/80 transition-colors hover:border-accent/40">
      <CardContent className="p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
          <div className="flex h-9 w-9 items-center justify-center border border-accent/20 bg-accent/10 transition-transform group-hover:-translate-y-0.5">{icon}</div>
        </div>
        <div className="font-display text-2xl font-black tracking-[-0.04em] md:text-3xl">{value}</div>
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
