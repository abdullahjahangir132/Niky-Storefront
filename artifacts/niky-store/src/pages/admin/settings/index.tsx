import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();

  const updateSettings = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "Settings saved" });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: (err: any) => toast({ title: err.message || "Error saving settings", variant: "destructive" }),
    },
  });

  const [storeInfo, setStoreInfo] = useState({ storeName: "", logoUrl: "", contactEmail: "", contactPhone: "", address: "" });
  const [socialMedia, setSocialMedia] = useState({ facebookUrl: "", instagramUrl: "", tiktokUrl: "" });
  const [shipping, setShipping] = useState({ shippingRate: "200", freeShippingThreshold: "3000", currency: "PKR" });
  const [passwordState, setPasswordState] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (settings) {
      setStoreInfo({
        storeName: settings.storeName || "NANO SHOES",
        logoUrl: settings.logoUrl || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || "",
      });
      setSocialMedia({
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
      });
      setShipping({
        shippingRate: settings.shippingRate?.toString() || "200",
        freeShippingThreshold: settings.freeShippingThreshold?.toString() || "3000",
        currency: settings.currency || "PKR",
      });
    }
  }, [settings]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    toast({ title: "Password change coming soon" });
    setPasswordState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-secondary rounded w-1/3" />
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your store preferences</p>
      </div>

      <div className="max-w-3xl space-y-8">
        <Tabs defaultValue="store-info">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-11">
            <TabsTrigger value="store-info" className="font-display uppercase tracking-wider text-xs">Store Info</TabsTrigger>
            <TabsTrigger value="social" className="font-display uppercase tracking-wider text-xs">Social Media</TabsTrigger>
            <TabsTrigger value="shipping" className="font-display uppercase tracking-wider text-xs">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="store-info">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: storeInfo }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg">General Information</CardTitle>
                  <CardDescription>Brand name, logo, and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input value={storeInfo.storeName} onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input value={storeInfo.logoUrl} onChange={(e) => setStoreInfo({ ...storeInfo, logoUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input type="email" value={storeInfo.contactEmail} onChange={(e) => setStoreInfo({ ...storeInfo, contactEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input value={storeInfo.contactPhone} onChange={(e) => setStoreInfo({ ...storeInfo, contactPhone: e.target.value })} placeholder="+92 300 0000000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} placeholder="Lahore, Pakistan" />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: socialMedia }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg">Social Media</CardTitle>
                  <CardDescription>Links shown in the storefront footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input value={socialMedia.instagramUrl} onChange={(e) => setSocialMedia({ ...socialMedia, instagramUrl: e.target.value })} placeholder="https://instagram.com/nanoshoes.pk" />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={socialMedia.facebookUrl} onChange={(e) => setSocialMedia({ ...socialMedia, facebookUrl: e.target.value })} placeholder="https://facebook.com/nanoshoes.pk" />
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <Input value={socialMedia.tiktokUrl} onChange={(e) => setSocialMedia({ ...socialMedia, tiktokUrl: e.target.value })} placeholder="https://tiktok.com/@nanoshoes.pk" />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: { shippingRate: Number(shipping.shippingRate), freeShippingThreshold: Number(shipping.freeShippingThreshold), currency: "PKR" } }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg">Shipping & Payments</CardTitle>
                  <CardDescription>Pakistan delivery rates in PKR.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Standard Shipping Rate (PKR)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PKR</span>
                        <Input type="number" min="0" className="pl-12" value={shipping.shippingRate} onChange={(e) => setShipping({ ...shipping, shippingRate: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Free Shipping Threshold (PKR)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PKR</span>
                        <Input type="number" min="0" className="pl-12" value={shipping.freeShippingThreshold} onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-sm text-muted-foreground">
                    Currency is fixed to <span className="font-bold text-foreground">PKR (Pakistani Rupee)</span> for this store.
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security */}
        <Card className="border-destructive/20">
          <form onSubmit={handlePasswordChange}>
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg text-destructive">Security</CardTitle>
              <CardDescription>Change your admin panel access key.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={passwordState.oldPassword} onChange={(e) => setPasswordState({ ...passwordState, oldPassword: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={passwordState.newPassword} onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" value={passwordState.confirmPassword} onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })} required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4">
              <Button type="submit" variant="destructive" className="font-display uppercase tracking-wider">Change Password</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
