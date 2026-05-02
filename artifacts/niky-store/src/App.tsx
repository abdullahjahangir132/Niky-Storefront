import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { ProtectedAdminRoute } from "@/components/admin/protected-route";
import { CartProvider } from "@/hooks/use-cart";
import { UserAuthProvider } from "@/hooks/use-user-auth";
import StoreLayout from "@/components/layout/store-layout";
import AdminLayout from "@/components/layout/admin-layout";

// Storefront
import Home from "@/pages/storefront/home";
import Shop from "@/pages/storefront/shop";
import ProductDetail from "@/pages/storefront/product-detail";
import Checkout from "@/pages/storefront/checkout";
import OrderConfirmation from "@/pages/storefront/order-confirmation";
import TrackOrder from "@/pages/storefront/track-order";
import Account from "@/pages/storefront/account";
import Wishlist from "@/pages/storefront/wishlist";
import About from "@/pages/storefront/about";
import Contact from "@/pages/storefront/contact";
import Faqs from "@/pages/storefront/faqs";
import SizeGuide from "@/pages/storefront/size-guide";

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
    },
  },
});

function AdminInner() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products/new" component={AdminProductForm} />
      <Route path="/admin/products/:id/edit" component={AdminProductForm} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Switch>
                  {/* Admin login — standalone, no layout */}
                  <Route path="/admin/login" component={AdminLogin} />

                  {/* All other /admin/* routes — protected + AdminLayout */}
                  <Route path="/admin/:rest*">
                    <ProtectedAdminRoute>
                      <AdminLayout>
                        <AdminInner />
                      </AdminLayout>
                    </ProtectedAdminRoute>
                  </Route>

                  {/* Storefront — catch-all (must be last in Switch) */}
                  <Route>
                    <StoreLayout>
                      <Switch>
                        <Route path="/" component={Home} />
                        <Route path="/shop" component={Shop} />
                        <Route path="/collections/:category" component={Shop} />
                        <Route path="/product/:slug" component={ProductDetail} />
                        <Route path="/checkout" component={Checkout} />
                        <Route path="/order/:id" component={OrderConfirmation} />
                        <Route path="/track-order" component={TrackOrder} />
                        <Route path="/account" component={Account} />
                        <Route path="/wishlist" component={Wishlist} />
                        <Route path="/about" component={About} />
                        <Route path="/contact" component={Contact} />
                        <Route path="/faqs" component={Faqs} />
                        <Route path="/size-guide" component={SizeGuide} />
                        <Route component={NotFound} />
                      </Switch>
                    </StoreLayout>
                  </Route>
                </Switch>
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </UserAuthProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
