import { useState } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useUpdateProfile, useChangePassword, useListOrders } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { User, Package, LogOut, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Account() {
  const { user, isLoggedIn, isLoading, login, register, logout } = useUserAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: ordersData } = useListOrders({ limit: 20 }, {
    query: { enabled: isLoggedIn, queryKey: ["listOrders", { limit: 20 }] },
  });

  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: () => toast({ title: "Profile updated" }),
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
  });

  const changePassword = useChangePassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Password changed" });
        setCurrentPassword("");
        setNewPassword("");
      },
      onError: () => toast({ title: "Password change failed", variant: "destructive" }),
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-4 max-w-sm mx-auto">
          <div className="h-8 bg-secondary rounded w-3/4 mx-auto" />
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center mb-8">
          <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">My Account</p>
          <h1 className="font-display font-black text-4xl uppercase tracking-tighter">Sign In</h1>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="login" className="flex-1 font-display uppercase tracking-wider">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1 font-display uppercase tracking-wider">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={(e) => { e.preventDefault(); login({ email: loginEmail, password: loginPassword }); }} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Email</Label>
                <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Password</Label>
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full font-display uppercase tracking-wider h-12" disabled={isLoading}>
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={(e) => { e.preventDefault(); register({ name: regName, email: regEmail, phone: regPhone, password: regPassword, confirmPassword: regPassword }); }} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Full Name</Label>
                <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Ahmed Khan" required />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Email</Label>
                <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Phone</Label>
                <Input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+92 300 1234567" />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Password</Label>
                <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
              </div>
              <Button type="submit" className="w-full font-display uppercase tracking-wider h-12" disabled={isLoading}>
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: "text-yellow-500", confirmed: "text-blue-500",
    shipped: "text-purple-500", delivered: "text-green-500", cancelled: "text-destructive",
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-2">My Account</p>
          <h1 className="font-display font-black text-4xl uppercase tracking-tighter">Welcome, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="font-display uppercase tracking-wider">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-8">
          <TabsTrigger value="orders" className="font-display uppercase tracking-wider">
            <Package className="w-4 h-4 mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="font-display uppercase tracking-wider">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="font-display uppercase tracking-wider">
            <Lock className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {!ordersData?.orders.length ? (
            <div className="text-center py-16 border border-border rounded-2xl">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl uppercase mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">Your order history will appear here.</p>
              <Link href="/shop"><Button className="font-display uppercase tracking-wider">Start Shopping</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData.orders.map((order: any) => (
                <div key={order.id} className="border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold">{order.orderNumber || `#${order.id}`}</p>
                      <span className={`text-xs font-bold uppercase capitalize ${STATUS_COLORS[order.status] || ""}`}>{order.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{formatPrice(order.total)}</span>
                    <Link href={`/order/${order.id}`}>
                      <Button variant="outline" size="sm" className="font-display uppercase tracking-wider text-xs">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate({ data: { name: profileName, phone: profilePhone } }); }} className="max-w-md space-y-4">
            <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">Edit Profile</h2>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Full Name</Label>
              <Input value={profileName || user?.name || ""} onChange={(e) => setProfileName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Email</Label>
              <Input value={user?.email} disabled className="opacity-60" />
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Phone</Label>
              <Input value={profilePhone || user?.phone || ""} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+92 300 1234567" />
            </div>
            <Button type="submit" className="font-display uppercase tracking-wider" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={(e) => { e.preventDefault(); changePassword.mutate({ data: { currentPassword, newPassword, confirmPassword: newPassword } }); }} className="max-w-md space-y-4">
            <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">Change Password</h2>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="font-display uppercase tracking-wider" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
