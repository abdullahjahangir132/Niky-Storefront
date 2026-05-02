import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminStats, useGetRecentOrders, useGetTopProducts, useGetMonthlyRevenue } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders({ limit: 5 });
  const { data: topProducts, isLoading: productsLoading } = useGetTopProducts({ limit: 4 });
  const { data: monthlyRevenue, isLoading: monthlyLoading } = useGetMonthlyRevenue();

  if (statsLoading || ordersLoading || productsLoading || monthlyLoading) {
    return <AdminLayout><div className="p-8 text-center text-muted-foreground">Loading dashboard data...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your store's performance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Total Revenue" 
          value={`$${stats?.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5 text-accent" />}
          trend={stats?.revenueChange}
        />
        <KpiCard 
          title="Orders" 
          value={stats?.totalOrders.toString()} 
          icon={<ShoppingCart className="w-5 h-5 text-accent" />}
          trend={stats?.ordersChange}
        />
        <KpiCard 
          title="Active Products" 
          value={stats?.totalProducts.toString()} 
          icon={<ShoppingBag className="w-5 h-5 text-accent" />}
        />
        <KpiCard 
          title="Customers" 
          value={stats?.totalCustomers.toString()} 
          icon={<Users className="w-5 h-5 text-accent" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider">Monthly Revenue (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `$${value}` : value, 
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#C8102E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#9ca3af" strokeWidth={2} dot={{ r: 3 }} name="orders" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {topProducts?.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-md overflow-hidden flex-shrink-0 border">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-muted-foreground text-xs">{product.salesCount} sold</p>
                </div>
                <div className="font-bold text-sm text-right">
                  ${product.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display uppercase tracking-wider">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">View All</Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4 font-medium">#{order.id.toString().padStart(6, '0')}</td>
                    <td className="px-4 py-4">{order.customerName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold">${order.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

function KpiCard({ title, value, icon, trend }: { title: string, value: string | undefined, icon: React.ReactNode, trend?: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <div className="text-3xl font-display font-bold tracking-tight">{value || "-"}</div>
          {trend !== undefined && (
            <p className={`text-xs flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              <span className="font-semibold">{Math.abs(trend)}%</span> from last month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
