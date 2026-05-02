import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        toast({ title: "Settings saved successfully" });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: err.message || "Error saving settings", variant: "destructive" });
      }
    }
  });

  // Local state for forms
  const [storeInfo, setStoreInfo] = useState({
    storeName: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: ""
  });
  
  const [socialMedia, setSocialMedia] = useState({
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: ""
  });
  
  const [shipping, setShipping] = useState({
    shippingRate: "0",
    freeShippingThreshold: "0",
    currency: "USD"
  });

  // Password state
  const [passwordState, setPasswordState] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (settings) {
      setStoreInfo({
        storeName: settings.storeName || "",
        logoUrl: settings.logoUrl || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || ""
      });
      
      setSocialMedia({
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        twitterUrl: settings.twitterUrl || ""
      });
      
      setShipping({
        shippingRate: settings.shippingRate?.toString() || "0",
        freeShippingThreshold: settings.freeShippingThreshold?.toString() || "0",
        currency: settings.currency || "USD"
      });
    }
  }, [settings]);

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ data: storeInfo });
  };

  const handleSaveSocialMedia = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ data: socialMedia });
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ 
      data: { 
        shippingRate: Number(shipping.shippingRate),
        freeShippingThreshold: Number(shipping.freeShippingThreshold),
        currency: shipping.currency
      } 
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    toast({ title: "Feature coming soon", description: "Password change will be implemented in the next update." });
    setPasswordState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (isLoading) {
    return <AdminLayout><div className="p-8 text-center text-muted-foreground">Loading settings...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your store preferences</p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        <Tabs defaultValue="store-info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-secondary rounded-lg">
            <TabsTrigger value="store-info" className="font-display uppercase tracking-wider h-full data-[state=active]:bg-background">Store Info</TabsTrigger>
            <TabsTrigger value="social" className="font-display uppercase tracking-wider h-full data-[state=active]:bg-background">Social Media</TabsTrigger>
            <TabsTrigger value="shipping" className="font-display uppercase tracking-wider h-full data-[state=active]:bg-background">Shipping & Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="store-info">
            <Card>
              <form onSubmit={handleSaveStoreInfo}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-xl">General Information</CardTitle>
                  <CardDescription>Basic details about your brand and business.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input id="storeName" value={storeInfo.storeName} onChange={(e) => setStoreInfo({...storeInfo, storeName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" value={storeInfo.logoUrl} onChange={(e) => setStoreInfo({...storeInfo, logoUrl: e.target.value})} placeholder="https://example.com/logo.png" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" type="email" value={storeInfo.contactEmail} onChange={(e) => setStoreInfo({...storeInfo, contactEmail: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" value={storeInfo.contactPhone} onChange={(e) => setStoreInfo({...storeInfo, contactPhone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <Input id="address" value={storeInfo.address} onChange={(e) => setStoreInfo({...storeInfo, address: e.target.value})} />
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
              <form onSubmit={handleSaveSocialMedia}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-xl">Social Media Links</CardTitle>
                  <CardDescription>Connect your social profiles to the storefront footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input id="instagramUrl" value={socialMedia.instagramUrl} onChange={(e) => setSocialMedia({...socialMedia, instagramUrl: e.target.value})} placeholder="https://instagram.com/niky" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input id="facebookUrl" value={socialMedia.facebookUrl} onChange={(e) => setSocialMedia({...socialMedia, facebookUrl: e.target.value})} placeholder="https://facebook.com/niky" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">X (Twitter) URL</Label>
                    <Input id="twitterUrl" value={socialMedia.twitterUrl} onChange={(e) => setSocialMedia({...socialMedia, twitterUrl: e.target.value})} placeholder="https://twitter.com/niky" />
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
              <form onSubmit={handleSaveShipping}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-xl">Shipping & Payments</CardTitle>
                  <CardDescription>Configure base rates and currency display.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingRate">Flat Shipping Rate</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">$</div>
                        <Input id="shippingRate" type="number" min="0" step="0.01" className="pl-7" value={shipping.shippingRate} onChange={(e) => setShipping({...shipping, shippingRate: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">$</div>
                        <Input id="freeShippingThreshold" type="number" min="0" step="0.01" className="pl-7" value={shipping.freeShippingThreshold} onChange={(e) => setShipping({...shipping, freeShippingThreshold: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Store Currency</Label>
                    <Select value={shipping.currency} onValueChange={(val) => setShipping({...shipping, currency: val})}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                        <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                      </SelectContent>
                    </Select>
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

        {/* Security Section */}
        <Card className="border-red-900/20 bg-red-50/10">
          <form onSubmit={handlePasswordChange}>
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-xl text-accent">Security</CardTitle>
              <CardDescription>Change admin panel access password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input id="oldPassword" type="password" value={passwordState.oldPassword} onChange={(e) => setPasswordState({...passwordState, oldPassword: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={passwordState.newPassword} onChange={(e) => setPasswordState({...passwordState, newPassword: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={passwordState.confirmPassword} onChange={(e) => setPasswordState({...passwordState, confirmPassword: e.target.value})} required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4">
              <Button type="submit" variant="destructive" className="font-display uppercase tracking-wider">
                Change Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}