import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { ProtectedAdminRoute } from "@/components/admin/protected-route";

// Storefront
import Home from "@/pages/storefront/home";
import Shop from "@/pages/storefront/shop";
import ProductDetail from "@/pages/storefront/product-detail";
import Checkout from "@/pages/storefront/checkout";
import OrderConfirmation from "@/pages/storefront/order-confirmation";

// Admin
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products/list";
import AdminProductForm from "@/pages/admin/products/form";
import AdminOrders from "@/pages/admin/orders/list";
import AdminCategories from "@/pages/admin/categories/list";
import AdminCustomers from "@/pages/admin/customers/list";
import AdminCoupons from "@/pages/admin/coupons/list";
import AdminSettings from "@/pages/admin/settings/index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function Router() {
  return (
    <Switch>
      {/* Storefront Routes */}
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/:id" component={OrderConfirmation} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/products">
        {() => <ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/products/new">
        {() => <ProtectedAdminRoute><AdminProductForm /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/products/:id/edit">
        {() => <ProtectedAdminRoute><AdminProductForm /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/orders">
        {() => <ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/categories">
        {() => <ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/customers">
        {() => <ProtectedAdminRoute><AdminCustomers /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/coupons">
        {() => <ProtectedAdminRoute><AdminCoupons /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/settings">
        {() => <ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
