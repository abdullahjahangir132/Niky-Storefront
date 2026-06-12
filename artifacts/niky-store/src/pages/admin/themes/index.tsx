import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Image, Palette, Save } from "lucide-react";
import { useTheme, type ThemeColors } from "@/components/providers/theme-provider";

const THEME_IDS = ["1", "2", "3"] as const;

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function AdminThemes() {
  const { settings, refetch } = useTheme();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState(settings.activeTheme);
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl);
  const [themes, setThemes] = useState<Record<string, ThemeColors>>({
    "1": settings.theme1,
    "2": settings.theme2,
    "3": settings.theme3,
  });

  useEffect(() => {
    setActiveTheme(settings.activeTheme);
    setHeroImageUrl(settings.heroImageUrl);
    setThemes({ "1": settings.theme1, "2": settings.theme2, "3": settings.theme3 });
  }, [settings]);

  const updateColor = (themeId: string, field: keyof ThemeColors, value: string) => {
    setThemes(prev => ({ ...prev, [themeId]: { ...prev[themeId], [field]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {
        activeTheme,
        heroImageUrl,
        theme1: JSON.stringify(themes["1"]),
        theme2: JSON.stringify(themes["2"]),
        theme3: JSON.stringify(themes["3"]),
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Theme saved!", description: "Changes applied to your store." });
      refetch();
    } catch {
      toast({ title: "Error", description: "Could not save theme.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const THEME_LABELS: Record<string, { emoji: string; desc: string }> = {
    "1": { emoji: "⚫", desc: "Classic dark — bold red accents" },
    "2": { emoji: "🌊", desc: "Deep navy — luxurious gold accents" },
    "3": { emoji: "🌿", desc: "Dark forest — vivid red-pink accents" },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-accent" />
            Themes
          </h1>
          <p className="text-muted-foreground mt-1">Choose a theme and customize its 3 colors. Changes apply live.</p>
        </div>
        <Button onClick={save} disabled={saving} className="h-11 px-6 font-bold uppercase tracking-wider">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {/* Theme Selector */}
      <div>
        <h2 className="font-display font-bold text-lg uppercase tracking-wider mb-4">Select Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THEME_IDS.map((id) => {
            const theme = themes[id];
            const isActive = activeTheme === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTheme(id)}
                className={`relative rounded-xl border-2 p-5 text-left transition-all duration-200 hover:scale-[1.02] ${
                  isActive ? "border-accent shadow-lg shadow-accent/20" : "border-border hover:border-muted-foreground/40"
                }`}
                style={{ backgroundColor: theme.bg }}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 bg-accent rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: theme.bg }} />
                  <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: theme.accent }} />
                  <div className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: theme.highlight }} />
                </div>
                <div>
                  <p className="font-display font-black text-base uppercase tracking-tight" style={{ color: theme.highlight }}>
                    {THEME_LABELS[id].emoji} {theme.name}
                  </p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: theme.highlight }}>
                    {THEME_LABELS[id].desc}
                  </p>
                </div>
                {isActive && (
                  <Badge className="mt-3 bg-accent text-white text-[10px] uppercase tracking-widest">Active</Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Customization */}
      <div>
        <h2 className="font-display font-bold text-lg uppercase tracking-wider mb-4">Customize Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {THEME_IDS.map((id) => {
            const theme = themes[id];
            const isActive = activeTheme === id;
            return (
              <div
                key={id}
                className={`rounded-xl border p-5 space-y-4 transition-all ${
                  isActive ? "border-accent/50 bg-accent/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold uppercase tracking-wider text-sm">{theme.name}</h3>
                  {isActive && <Badge className="bg-accent text-white text-[10px] uppercase tracking-widest">Active</Badge>}
                </div>

                {/* Theme name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theme Name</Label>
                  <Input
                    value={theme.name}
                    onChange={e => updateColor(id, "name", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Background color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Background Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={theme.bg}
                        onChange={e => updateColor(id, "bg", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent"
                        style={{ padding: "2px" }}
                      />
                    </div>
                    <Input
                      value={theme.bg}
                      onChange={e => updateColor(id, "bg", e.target.value)}
                      className="h-9 text-sm font-mono"
                      placeholder="#0a0a0a"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">HSL: {hexToHsl(theme.bg || "#0a0a0a")}</p>
                </div>

                {/* Accent color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Accent / Highlight Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.accent}
                      onChange={e => updateColor(id, "accent", e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent"
                      style={{ padding: "2px" }}
                    />
                    <Input
                      value={theme.accent}
                      onChange={e => updateColor(id, "accent", e.target.value)}
                      className="h-9 text-sm font-mono"
                      placeholder="#c8102e"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">HSL: {hexToHsl(theme.accent || "#c8102e")}</p>
                </div>

                {/* Highlight / Text color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Text / Foreground Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.highlight}
                      onChange={e => updateColor(id, "highlight", e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent"
                      style={{ padding: "2px" }}
                    />
                    <Input
                      value={theme.highlight}
                      onChange={e => updateColor(id, "highlight", e.target.value)}
                      className="h-9 text-sm font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">HSL: {hexToHsl(theme.highlight || "#ffffff")}</p>
                </div>

                {/* Mini preview */}
                <div
                  className="rounded-lg p-4 mt-2"
                  style={{ backgroundColor: theme.bg, border: `1px solid ${theme.accent}30` }}
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: theme.accent }}>
                    Preview
                  </p>
                  <p className="font-black text-lg uppercase tracking-tight leading-none" style={{ color: theme.highlight }}>
                    NANO SHOES
                  </p>
                  <div
                    className="mt-3 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-center"
                    style={{ backgroundColor: theme.accent, color: "#ffffff" }}
                  >
                    Shop Now
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Image */}
      <div>
        <h2 className="font-display font-bold text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-accent" />
          Hero Background Image
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URL</Label>
            <Input
              value={heroImageUrl}
              onChange={e => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/shoe.jpg"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste any image URL. Best size: 1600×900px or larger. Use Unsplash, your CDN, or any public URL.
            </p>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Red Nike", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80" },
                  { label: "White Sneaker", url: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1600&q=80" },
                  { label: "Running Shoe", url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=80" },
                  { label: "Jordan", url: "https://images.unsplash.com/photo-1556906781-9a412961d28f?w=1600&q=80" },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => setHeroImageUrl(p.url)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded border transition-colors ${
                      heroImageUrl === p.url
                        ? "border-accent bg-accent text-white"
                        : "border-border hover:border-accent/50 text-muted-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-video bg-secondary/30">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No image URL set
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <p className="font-display font-black text-white text-2xl uppercase tracking-tight leading-none">
                Move Beyond<br /><span className="text-accent">Limits</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={save} disabled={saving} size="lg" className="h-12 px-10 font-bold uppercase tracking-wider">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
