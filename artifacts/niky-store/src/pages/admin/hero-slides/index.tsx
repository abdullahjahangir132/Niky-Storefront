import { useEffect, useRef, useState } from "react";
import {
  useListAdminHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
  getListAdminHeroSlidesQueryKey,
  getListHeroSlidesQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Plus, GalleryHorizontal, ArrowUp, ArrowDown, Image as ImageIcon, Video, Upload } from "lucide-react";

type MediaType = "image" | "video";

interface FormState {
  mediaType: MediaType;
  imageUrl: string;
  imageUrl2: string;
  videoUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  mediaType: "image",
  imageUrl: "",
  imageUrl2: "",
  videoUrl: "",
  title: "",
  subtitle: "",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  secondaryCtaText: "",
  secondaryCtaLink: "",
  sortOrder: 0,
  isActive: true,
};

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${import.meta.env.BASE_URL}api/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

function MediaUploadField({
  label,
  value,
  onChange,
  accept,
  icon,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept: string;
  icon: React.ReactNode;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast({ title: "Uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">{icon} {label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste a URL or upload a file" className="flex-1" />
        <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      </div>
      {value && (
        accept.startsWith("video") ? (
          <video src={value} className="w-full h-32 object-cover rounded-lg border border-border" muted />
        ) : (
          <img src={value} alt="" className="w-full h-32 object-cover rounded-lg border border-border" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
        )
      )}
    </div>
  );
}

export default function AdminHeroSlides() {
  const { data: slides, isLoading } = useListAdminHeroSlides();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListAdminHeroSlidesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListHeroSlidesQueryKey() });
  };

  const createSlide = useCreateHeroSlide({
    mutation: {
      onSuccess: () => { toast({ title: "Slide added" }); setIsOpen(false); resetForm(); invalidate(); },
      onError: () => toast({ title: "Error adding slide", variant: "destructive" }),
    },
  });

  const updateSlide = useUpdateHeroSlide({
    mutation: {
      onSuccess: () => { toast({ title: "Slide updated" }); setIsOpen(false); resetForm(); invalidate(); },
      onError: () => toast({ title: "Error updating slide", variant: "destructive" }),
    },
  });

  const deleteSlide = useDeleteHeroSlide({
    mutation: {
      onSuccess: () => { toast({ title: "Slide deleted" }); invalidate(); },
      onError: () => toast({ title: "Error deleting slide", variant: "destructive" }),
    },
  });

  const resetForm = () => { setForm({ ...EMPTY_FORM, sortOrder: slides?.length ?? 0 }); setEditingId(null); };

  const handleEdit = (slide: NonNullable<typeof slides>[number]) => {
    setForm({
      mediaType: (slide.mediaType as MediaType) || "image",
      imageUrl: slide.imageUrl,
      imageUrl2: slide.imageUrl2,
      videoUrl: slide.videoUrl,
      title: slide.title,
      subtitle: slide.subtitle,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      secondaryCtaText: slide.secondaryCtaText,
      secondaryCtaLink: slide.secondaryCtaLink,
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setEditingId(slide.id);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this hero slide?")) deleteSlide.mutate({ id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      mediaType: form.mediaType,
      imageUrl: form.mediaType === "image" ? form.imageUrl : "",
      imageUrl2: form.mediaType === "image" ? form.imageUrl2 : "",
      videoUrl: form.mediaType === "video" ? form.videoUrl : "",
      title: form.title,
      subtitle: form.subtitle,
      ctaText: form.ctaText,
      ctaLink: form.ctaLink,
      secondaryCtaText: form.secondaryCtaText,
      secondaryCtaLink: form.secondaryCtaLink,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    if (editingId) updateSlide.mutate({ id: editingId, data });
    else createSlide.mutate({ data });
  };

  const move = (index: number, dir: -1 | 1) => {
    if (!slides) return;
    const target = slides[index + dir];
    const current = slides[index];
    if (!target || !current) return;
    updateSlide.mutate({ id: current.id, data: { sortOrder: target.sortOrder } });
    updateSlide.mutate({ id: target.id, data: { sortOrder: current.sortOrder } });
  };

  useEffect(() => {
    if (isOpen && editingId === null) setForm((f) => ({ ...f, sortOrder: slides?.length ?? 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight flex items-center gap-3">
            <GalleryHorizontal className="w-8 h-8 text-accent" />
            Hero Slides
          </h1>
          <p className="text-muted-foreground mt-1">
            Control the homepage hero. Add as many slides as you like — each one can use a single picture, two pictures, or a video, your choice.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-display uppercase tracking-wider"><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-2xl tracking-tight">{editingId ? "Edit Slide" : "New Slide"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4">
              <div className="space-y-2">
                <Label>Media Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.mediaType === "image" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setForm({ ...form, mediaType: "image" })}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" /> Picture(s)
                  </Button>
                  <Button
                    type="button"
                    variant={form.mediaType === "video" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setForm({ ...form, mediaType: "video" })}
                  >
                    <Video className="w-4 h-4 mr-2" /> Video
                  </Button>
                </div>
              </div>

              {form.mediaType === "image" ? (
                <>
                  <MediaUploadField
                    label="Picture 1 (required)"
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    accept="image/*"
                    icon={<ImageIcon className="w-3.5 h-3.5" />}
                  />
                  <MediaUploadField
                    label="Picture 2 (optional — leave blank for a single picture)"
                    value={form.imageUrl2}
                    onChange={(url) => setForm({ ...form, imageUrl2: url })}
                    accept="image/*"
                    icon={<ImageIcon className="w-3.5 h-3.5" />}
                  />
                </>
              ) : (
                <MediaUploadField
                  label="Video (mp4/webm)"
                  value={form.videoUrl}
                  onChange={(url) => setForm({ ...form, videoUrl: url })}
                  accept="video/*"
                  icon={<Video className="w-3.5 h-3.5" />}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Move Beyond Limits" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Pakistan's Premium Footwear" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} placeholder="Shop Now" />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/shop" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>2nd Button Text (optional)</Label>
                  <Input value={form.secondaryCtaText} onChange={(e) => setForm({ ...form, secondaryCtaText: e.target.value })} placeholder="Sale Items" />
                </div>
                <div className="space-y-2">
                  <Label>2nd Button Link (optional)</Label>
                  <Input value={form.secondaryCtaLink} onChange={(e) => setForm({ ...form, secondaryCtaLink: e.target.value })} placeholder="/shop?onSale=true" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Only active slides show on the homepage.</p>
                </div>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createSlide.isPending || updateSlide.isPending}>
                  {editingId ? "Update Slide" : "Add Slide"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />)
        ) : slides?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
            No hero slides yet. Add your first one — a single picture, two pictures, or a video, your choice.
          </div>
        ) : (
          slides?.map((slide, i) => (
            <div key={slide.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-64 h-40 bg-secondary relative flex-shrink-0">
                {slide.mediaType === "video" && slide.videoUrl ? (
                  <video src={slide.videoUrl} className="w-full h-full object-cover" muted />
                ) : slide.imageUrl ? (
                  <div className="w-full h-full grid grid-cols-1" style={{ gridTemplateColumns: slide.imageUrl2 ? "1fr 1fr" : "1fr" }}>
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    {slide.imageUrl2 && <img src={slide.imageUrl2} alt="" className="w-full h-full object-cover" />}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {!slide.isActive && (
                  <div className="absolute top-2 left-2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Hidden
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display font-black uppercase tracking-tight text-lg truncate">{slide.title || "Untitled Slide"}</p>
                  <p className="text-sm text-muted-foreground truncate">{slide.subtitle}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 uppercase tracking-wider">
                    {slide.mediaType === "video" ? "Video" : slide.imageUrl2 ? "2 Pictures" : "1 Picture"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" disabled={i === (slides?.length ?? 0) - 1} onClick={() => move(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(slide)}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => handleDelete(slide.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
