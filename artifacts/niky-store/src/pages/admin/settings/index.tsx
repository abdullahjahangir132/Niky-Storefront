import { useState, useEffect, useRef } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getStoreSettingsQueryKey, PublicStoreSettings } from "@/hooks/use-store-settings";
import { Save, Upload, Instagram, Facebook, Store, Smartphone, Globe, Phone, MessageCircle, Bot, Eye, EyeOff, CheckCircle2, Plus, Trash2, Megaphone, Tag } from "lucide-react";

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).url as string;
}

function LogoUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast({ title: "Logo uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-start">
        <div className="flex-1 space-y-2">
          <Label>Logo URL</Label>
          <Input value={value} onChange={e => onChange(e.target.value)} placeholder="https://... ya file upload karein" />
        </div>
        <div className="pt-7">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="font-display uppercase tracking-wider text-xs">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
      {value && (
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border">
          <img src={value} alt="Logo preview" className="h-12 max-w-[120px] object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preview</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{value}</p>
          </div>
          <button type="button" onClick={() => onChange("")} className="ml-auto text-xs text-destructive hover:underline">Remove</button>
        </div>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();

  const updateSettings = useUpdateSettings({
    mutation: {
      onSuccess: (savedSettings) => {
        toast({ title: "Settings saved ✓" });
        queryClient.setQueryData(getGetSettingsQueryKey(), savedSettings);
        queryClient.setQueryData<PublicStoreSettings>(
          getStoreSettingsQueryKey(),
          (current) => ({ ...current, storeName: savedSettings.storeName }),
        );
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getStoreSettingsQueryKey() });
      },
      onError: (err: any) => toast({ title: err.message || "Error saving settings", variant: "destructive" }),
    },
  });

  const [storeInfo, setStoreInfo] = useState({
    storeName: "", logoUrl: "", contactEmail: "", contactPhone: "", whatsappNumber: "", address: "",
  });
  const [socialMedia, setSocialMedia] = useState({
    facebookUrl: "", instagramUrl: "", tiktokUrl: "", youtubeUrl: "",
  });
  const [appLinks, setAppLinks] = useState({
    playStoreUrl: "", appStoreUrl: "",
  });
  const [shipping, setShipping] = useState({
    shippingRate: "200", freeShippingThreshold: "3000", currency: "PKR",
  });
  const [passwordState, setPasswordState] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [aiSettings, setAiSettings] = useState({
    aiProvider: "anthropic" as "gemini" | "openai" | "anthropic",
    geminiApiKey: "",
    openaiApiKey: "",
    anthropicApiKey: "",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [announcementBar, setAnnouncementBar] = useState({
    enabled: true,
    items: ["📞 Helpline: +92 300 1234567", "🚚 Standard shipping PKR 200", "🎉 Free shipping above PKR 3,000", "✨ New Collection — Drop I LIVE NOW"],
    newItem: "",
  });
  const [tagBar, setTagBar] = useState({
    enabled: true,
    items: ["NANO AIR", "NANO PRO", "NANO FLEX", "NANO CLASSIC", "NANO SPORT", "NANO LITE"],
    newItem: "",
  });

  useEffect(() => {
    if (settings) {
      setStoreInfo({
        storeName: (settings as any).storeName || "NANO SHOES",
        logoUrl: (settings as any).logoUrl || "",
        contactEmail: (settings as any).contactEmail || "",
        contactPhone: (settings as any).contactPhone || "",
        whatsappNumber: (settings as any).whatsappNumber || "",
        address: (settings as any).address || "",
      });
      setSocialMedia({
        facebookUrl: (settings as any).facebookUrl || "",
        instagramUrl: (settings as any).instagramUrl || "",
        tiktokUrl: (settings as any).tiktokUrl || "",
        youtubeUrl: (settings as any).youtubeUrl || "",
      });
      setAppLinks({
        playStoreUrl: (settings as any).playStoreUrl || "",
        appStoreUrl: (settings as any).appStoreUrl || "",
      });
      setShipping({
        shippingRate: (settings as any).shippingRate?.toString() || "200",
        freeShippingThreshold: (settings as any).freeShippingThreshold?.toString() || "3000",
        currency: "PKR",
      });
      setAiSettings({
        aiProvider: (settings as any).aiProvider || "anthropic",
        geminiApiKey: (settings as any).geminiApiKey || "",
        openaiApiKey: (settings as any).openaiApiKey || "",
        anthropicApiKey: (settings as any).anthropicApiKey || "",
      });
      // Announcement bar
      try {
        const annItems = JSON.parse((settings as any).announcementBarItems || "[]");
        setAnnouncementBar((prev) => ({
          ...prev,
          enabled: (settings as any).announcementBarEnabled !== "false",
          items: Array.isArray(annItems) && annItems.length > 0 ? annItems : prev.items,
        }));
      } catch { /* keep defaults */ }
      // Tag bar
      try {
        const tagItems = JSON.parse((settings as any).tagBarItems || "[]");
        setTagBar((prev) => ({
          ...prev,
          enabled: (settings as any).tagBarEnabled !== "false",
          items: Array.isArray(tagItems) && tagItems.length > 0 ? tagItems : prev.items,
        }));
      } catch { /* keep defaults */ }
    }
  }, [settings]);

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
          <TabsList className="grid w-full grid-cols-6 mb-6 h-11">
            <TabsTrigger value="store-info" className="font-display uppercase tracking-wider text-xs">Store</TabsTrigger>
            <TabsTrigger value="social" className="font-display uppercase tracking-wider text-xs">Social</TabsTrigger>
            <TabsTrigger value="app-links" className="font-display uppercase tracking-wider text-xs">Apps</TabsTrigger>
            <TabsTrigger value="shipping" className="font-display uppercase tracking-wider text-xs">Shipping</TabsTrigger>
            <TabsTrigger value="ai" className="font-display uppercase tracking-wider text-xs flex items-center gap-1">
              <Bot className="w-3 h-3" /> AI
            </TabsTrigger>
            <TabsTrigger value="bars" className="font-display uppercase tracking-wider text-xs flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> Bars
            </TabsTrigger>
          </TabsList>

          {/* Store Info Tab */}
          <TabsContent value="store-info">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: storeInfo }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg">General Information</CardTitle>
                  <CardDescription>Brand name, logo, and contact details shown on the website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Store Name</Label>
                    <Input value={storeInfo.storeName} onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Logo</Label>
                    <LogoUploadField value={storeInfo.logoUrl} onChange={(v) => setStoreInfo({ ...storeInfo, logoUrl: v })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Contact Email</Label>
                      <Input type="email" value={storeInfo.contactEmail} onChange={(e) => setStoreInfo({ ...storeInfo, contactEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Contact Phone</Label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" value={storeInfo.contactPhone} onChange={(e) => setStoreInfo({ ...storeInfo, contactPhone: e.target.value })} placeholder="+92 300 0000000" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground flex items-center gap-1.5">
                      <MessageCircle size={13} className="text-green-500" /> WhatsApp Number
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-500">WA</span>
                      <Input className="pl-9" value={storeInfo.whatsappNumber} onChange={(e) => setStoreInfo({ ...storeInfo, whatsappNumber: e.target.value })} placeholder="+92 300 0000000" />
                    </div>
                    <p className="text-xs text-muted-foreground">Footer mein WhatsApp chat button show hoga</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Address</Label>
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

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: socialMedia }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg">Social Media</CardTitle>
                  <CardDescription>Links shown in the website footer and contact page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      <div className="w-6 h-6 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                        <Instagram size={13} className="text-white" />
                      </div>
                      Instagram
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">instagram.com/</span>
                      <Input
                        className="pl-28"
                        value={socialMedia.instagramUrl.replace(/.*instagram\.com\/?/, "")}
                        onChange={(e) => setSocialMedia({ ...socialMedia, instagramUrl: e.target.value ? `https://instagram.com/${e.target.value}` : "" })}
                        placeholder="nanoshoes.pk"
                      />
                    </div>
                    {socialMedia.instagramUrl && (
                      <a href={socialMedia.instagramUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                        {socialMedia.instagramUrl}
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook size={13} className="text-white" />
                      </div>
                      Facebook
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">facebook.com/</span>
                      <Input
                        className="pl-28"
                        value={socialMedia.facebookUrl.replace(/.*facebook\.com\/?/, "")}
                        onChange={(e) => setSocialMedia({ ...socialMedia, facebookUrl: e.target.value ? `https://facebook.com/${e.target.value}` : "" })}
                        placeholder="nanoshoes.pk"
                      />
                    </div>
                    {socialMedia.facebookUrl && (
                      <a href={socialMedia.facebookUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                        {socialMedia.facebookUrl}
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      <div className="w-6 h-6 bg-black border border-border rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-[9px]">TT</span>
                      </div>
                      TikTok
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">tiktok.com/@</span>
                      <Input
                        className="pl-24"
                        value={socialMedia.tiktokUrl.replace(/.*tiktok\.com\/@?/, "")}
                        onChange={(e) => setSocialMedia({ ...socialMedia, tiktokUrl: e.target.value ? `https://tiktok.com/@${e.target.value}` : "" })}
                        placeholder="nanoshoes.pk"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center">
                        <Globe size={13} className="text-white" />
                      </div>
                      YouTube
                    </Label>
                    <Input
                      value={socialMedia.youtubeUrl}
                      onChange={(e) => setSocialMedia({ ...socialMedia, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/@nanoshoes.pk"
                    />
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

          {/* App Links Tab */}
          <TabsContent value="app-links">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: appLinks as any }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-accent" /> Mobile App Links
                  </CardTitle>
                  <CardDescription>
                    Apni mobile app ka link yahan add karein — website footer mein "Download App" buttons show honge.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      <div className="w-7 h-7 bg-green-600 rounded-xl flex items-center justify-center">
                        <Store size={14} className="text-white" />
                      </div>
                      Google Play Store Link
                    </Label>
                    <Input
                      value={appLinks.playStoreUrl}
                      onChange={(e) => setAppLinks({ ...appLinks, playStoreUrl: e.target.value })}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                    />
                    <p className="text-xs text-muted-foreground">Google Play par app publish hone ke baad link yahan paste karein</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                      <div className="w-7 h-7 bg-gray-800 rounded-xl flex items-center justify-center">
                        <Smartphone size={14} className="text-white" />
                      </div>
                      Apple App Store Link
                    </Label>
                    <Input
                      value={appLinks.appStoreUrl}
                      onChange={(e) => setAppLinks({ ...appLinks, appStoreUrl: e.target.value })}
                      placeholder="https://apps.apple.com/app/id..."
                    />
                    <p className="text-xs text-muted-foreground">iOS App Store par app publish hone ke baad link yahan paste karein</p>
                  </div>

                  {(appLinks.playStoreUrl || appLinks.appStoreUrl) && (
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">Preview — Footer mein aisa dikhega:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {appLinks.playStoreUrl && (
                          <div className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg text-xs">
                            <Store size={14} />
                            <div>
                              <div className="text-[9px] opacity-70">GET IT ON</div>
                              <div className="font-bold text-[11px]">Google Play</div>
                            </div>
                          </div>
                        )}
                        {appLinks.appStoreUrl && (
                          <div className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg text-xs">
                            <Smartphone size={14} />
                            <div>
                              <div className="text-[9px] opacity-70">DOWNLOAD ON THE</div>
                              <div className="font-bold text-[11px]">App Store</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                    <Save className="w-4 h-4 mr-2" /> Save Links
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
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
                      <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Standard Shipping Rate (PKR)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PKR</span>
                        <Input type="number" min="0" className="pl-12" value={shipping.shippingRate} onChange={(e) => setShipping({ ...shipping, shippingRate: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Free Shipping Threshold (PKR)</Label>
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
          {/* AI Settings Tab */}
          <TabsContent value="ai">
            <Card>
              <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate({ data: aiSettings as any }); }}>
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-accent" /> AI Chatbot Settings
                  </CardTitle>
                  <CardDescription>
                    NanoBot ke liye AI provider aur API key set karein. Keys sirf admin panel mein safe rakhi jaati hain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Provider Selector */}
                  <div className="space-y-3">
                    <p className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Active AI Provider</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "gemini", label: "Gemini 2.0 Flash", sub: "Google · Free tier", color: "bg-blue-500", badge: "FREE" },
                        { id: "openai", label: "GPT-4o Mini", sub: "OpenAI · Cheapest", color: "bg-emerald-500", badge: "FAST" },
                        { id: "anthropic", label: "Claude Haiku", sub: "Anthropic · Smart", color: "bg-orange-500", badge: "SMART" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAiSettings({ ...aiSettings, aiProvider: p.id as any })}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                            aiSettings.aiProvider === p.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className={`w-8 h-8 ${p.color} rounded-lg mb-3 flex items-center justify-center`}>
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <p className="font-bold text-sm leading-tight">{p.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.sub}</p>
                          <span className="absolute top-2 right-2 text-[9px] font-black tracking-wider bg-secondary px-1.5 py-0.5 rounded-md">{p.badge}</span>
                          {aiSettings.aiProvider === p.id && (
                            <CheckCircle2 className="absolute bottom-2 right-2 w-4 h-4 text-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Keys */}
                  {[
                    { key: "geminiApiKey", label: "Google Gemini API Key", placeholder: "AIza...", help: "console.cloud.google.com se banayein ya aistudio.google.com", provider: "gemini" },
                    { key: "openaiApiKey", label: "OpenAI API Key", placeholder: "sk-proj-...", help: "platform.openai.com/api-keys se banayein", provider: "openai" },
                    { key: "anthropicApiKey", label: "Anthropic (Claude) API Key", placeholder: "sk-ant-...", help: "console.anthropic.com se banayein", provider: "anthropic" },
                  ].map((field) => (
                    <div key={field.key} className={`space-y-2 p-4 rounded-xl border transition-colors ${aiSettings.aiProvider === field.provider ? "border-accent/30 bg-accent/5" : "border-border"}`}>
                      <Label className={`font-bold uppercase tracking-wider text-xs flex items-center gap-2 ${aiSettings.aiProvider === field.provider ? "text-foreground" : "text-muted-foreground"}`}>
                        {aiSettings.aiProvider === field.provider && <CheckCircle2 className="w-3 h-3 text-accent" />}
                        {field.label}
                        {aiSettings.aiProvider === field.provider && (
                          <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded font-black tracking-wider">ACTIVE</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showKeys[field.key] ? "text" : "password"}
                          value={(aiSettings as any)[field.key]}
                          onChange={(e) => setAiSettings({ ...aiSettings, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys({ ...showKeys, [field.key]: !showKeys[field.key] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKeys[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{field.help}</p>
                      {(aiSettings as any)[field.key] && (
                        <p className="text-xs text-emerald-600 font-bold">✓ Key saved</p>
                      )}
                    </div>
                  ))}

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <p className="font-bold mb-1">Cost Estimates (per 1,000 messages approx):</p>
                    <p>🔵 Gemini 2.0 Flash — $0.05–0.10 | 🟢 GPT-4o Mini — $0.10–0.20 | 🟠 Claude Haiku — $0.15–0.30</p>
                    <p className="mt-1 text-amber-700">Usage details: Admin → AI Usage page mein dekhein</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                    <Save className="w-4 h-4 mr-2" /> Save AI Settings
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Bars Tab */}
          <TabsContent value="bars">
            <div className="space-y-6">
              {/* Announcement Bar */}
              <Card>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings.mutate({ data: {
                    announcementBarEnabled: String(announcementBar.enabled),
                    announcementBarItems: JSON.stringify(announcementBar.items),
                  } as any });
                }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-accent" /> Announcement Bar
                        </CardTitle>
                        <CardDescription>Scrolling ticker at the top of every page. Great for promotions, helpline, free shipping info.</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {announcementBar.enabled ? "On" : "Off"}
                        </Label>
                        <Switch
                          checked={announcementBar.enabled}
                          onCheckedChange={(v) => setAnnouncementBar({ ...announcementBar, enabled: v })}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Existing items */}
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Items (drag to reorder)</Label>
                      {announcementBar.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const updated = [...announcementBar.items];
                              updated[i] = e.target.value;
                              setAnnouncementBar({ ...announcementBar, items: updated });
                            }}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setAnnouncementBar({ ...announcementBar, items: announcementBar.items.filter((_, idx) => idx !== i) })}
                            className="shrink-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* Add new item */}
                    <div className="flex gap-2">
                      <Input
                        value={announcementBar.newItem}
                        onChange={(e) => setAnnouncementBar({ ...announcementBar, newItem: e.target.value })}
                        placeholder="e.g. 🎉 Sale ends Sunday!"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (announcementBar.newItem.trim()) {
                              setAnnouncementBar({ ...announcementBar, items: [...announcementBar.items, announcementBar.newItem.trim()], newItem: "" });
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (announcementBar.newItem.trim()) {
                            setAnnouncementBar({ ...announcementBar, items: [...announcementBar.items, announcementBar.newItem.trim()], newItem: "" });
                          }
                        }}
                        className="shrink-0 font-display uppercase tracking-wider text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                      </Button>
                    </div>
                    {/* Preview */}
                    {announcementBar.items.length > 0 && announcementBar.enabled && (
                      <div className="bg-[#111] rounded-lg overflow-hidden">
                        <div className="flex items-center h-9 overflow-hidden">
                          <div className="flex animate-marquee whitespace-nowrap">
                            {[...announcementBar.items, ...announcementBar.items].map((item, i) => (
                              <span key={i} className="flex items-center flex-shrink-0">
                                <span className="text-[11px] font-semibold tracking-wider uppercase px-8 text-white">{item}</span>
                                <span className="text-accent/60 text-[10px]">•</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                      <Save className="w-4 h-4 mr-2" /> Save Announcement Bar
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Tag Bar */}
              <Card>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings.mutate({ data: {
                    tagBarEnabled: String(tagBar.enabled),
                    tagBarItems: JSON.stringify(tagBar.items),
                  } as any });
                }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2">
                          <Tag className="w-4 h-4 text-accent" /> Tag Scroll Bar
                        </CardTitle>
                        <CardDescription>Scrolling brand line names below the hero carousel. Click each tag to browse that collection.</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {tagBar.enabled ? "On" : "Off"}
                        </Label>
                        <Switch
                          checked={tagBar.enabled}
                          onCheckedChange={(v) => setTagBar({ ...tagBar, enabled: v })}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Existing items */}
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Brand Lines</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {tagBar.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const updated = [...tagBar.items];
                                updated[i] = e.target.value;
                                setTagBar({ ...tagBar, items: updated });
                              }}
                              className="text-sm font-display uppercase tracking-wide"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setTagBar({ ...tagBar, items: tagBar.items.filter((_, idx) => idx !== i) })}
                              className="shrink-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Add new item */}
                    <div className="flex gap-2">
                      <Input
                        value={tagBar.newItem}
                        onChange={(e) => setTagBar({ ...tagBar, newItem: e.target.value })}
                        placeholder="e.g. NANO RUN"
                        className="text-sm font-display uppercase tracking-wide"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (tagBar.newItem.trim()) {
                              setTagBar({ ...tagBar, items: [...tagBar.items, tagBar.newItem.trim().toUpperCase()], newItem: "" });
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (tagBar.newItem.trim()) {
                            setTagBar({ ...tagBar, items: [...tagBar.items, tagBar.newItem.trim().toUpperCase()], newItem: "" });
                          }
                        }}
                        className="shrink-0 font-display uppercase tracking-wider text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                      </Button>
                    </div>
                    {/* Preview */}
                    {tagBar.items.length > 0 && tagBar.enabled && (
                      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                        <div className="flex items-center h-14 overflow-hidden">
                          <div className="flex animate-marquee whitespace-nowrap">
                            {[...tagBar.items, ...tagBar.items, ...tagBar.items].map((item, i) => (
                              <span key={i} className="flex items-center flex-shrink-0">
                                <span className="font-display font-black text-sm uppercase tracking-[0.15em] text-white/80 px-10">{item}</span>
                                <span className="text-accent font-black text-base">+</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={updateSettings.isPending} className="font-display uppercase tracking-wider">
                      <Save className="w-4 h-4 mr-2" /> Save Tag Bar
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Security */}
        <Card className="border-destructive/20">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordState.newPassword !== passwordState.confirmPassword) {
              toast({ title: "Passwords do not match", variant: "destructive" });
              return;
            }
            toast({ title: "Password change coming soon" });
            setPasswordState({ oldPassword: "", newPassword: "", confirmPassword: "" });
          }}>
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg text-destructive">Security</CardTitle>
              <CardDescription>Change your admin panel access key.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Current Password</Label>
                <Input type="password" value={passwordState.oldPassword} onChange={(e) => setPasswordState({ ...passwordState, oldPassword: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">New Password</Label>
                  <Input type="password" value={passwordState.newPassword} onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Confirm Password</Label>
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
