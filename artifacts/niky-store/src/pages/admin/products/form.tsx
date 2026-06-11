import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetProduct, useCreateProduct, useUpdateProduct, useListCategories } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Upload, Link2, X, Plus, Images, Video, Star } from "lucide-react";
import { Link } from "wouter";

const MAX_IMAGES = 6;

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().min(1, "Price must be > 0"),
  salePrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sizes: z.string().min(1, "At least one size required"),
  colors: z.string().min(1, "At least one color required"),
  shortDescription: z.string().optional(),
  mainCategory: z.string().optional(),
  subCategory: z.string().optional(),
  brandLine: z.string().optional(),
  sku: z.string().optional(),
  videoUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
});

type FormValues = z.infer<typeof productSchema>;

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

function AddImageSlot({
  onAdd,
  disabled,
}: {
  onAdd: (url: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [urlValue, setUrlValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      onAdd(url);
      setOpen(false);
      toast({ title: "Image uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleUrlAdd() {
    if (!urlValue.trim()) return;
    onAdd(urlValue.trim());
    setUrlValue("");
    setOpen(false);
  }

  if (disabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
      >
        <Plus size={22} />
        <span className="text-xs font-bold uppercase tracking-wider">Add</span>
      </button>
    );
  }

  return (
    <div className="aspect-square rounded-xl border-2 border-accent bg-card p-3 flex flex-col gap-2">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors ${mode === "url" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
        >
          <Link2 size={9} /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors ${mode === "upload" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
        >
          <Upload size={9} /> File
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <X size={12} />
        </button>
      </div>
      {mode === "url" ? (
        <div className="flex flex-col gap-1.5 flex-1">
          <input
            className="w-full text-[10px] bg-background border border-border rounded px-2 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
            placeholder="https://..."
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleUrlAdd())}
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            className="w-full py-1 bg-accent text-white text-[10px] font-bold uppercase tracking-wider rounded"
          >
            Add
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer rounded border border-dashed border-border hover:border-accent transition-colors"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Upload size={14} className="text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground text-center px-1">
            {uploading ? "Uploading…" : "Click to pick file"}
          </span>
        </div>
      )}
    </div>
  );
}

function MultiImagesField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  function addImage(url: string) {
    if (images.length >= MAX_IMAGES) return;
    onChange([...images, url]);
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
            <img
              src={url}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
            />
            {idx === 0 && (
              <div className="absolute top-1.5 left-1.5 bg-accent text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star size={8} /> Primary
              </div>
            )}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full hidden group-hover:flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <AddImageSlot onAdd={addImage} disabled={images.length >= MAX_IMAGES} />
      </div>
      <p className="text-xs text-muted-foreground">
        {images.length}/{MAX_IMAGES} images — First image is primary. Hover to remove.
      </p>
    </div>
  );
}

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const isEdit = !!params?.id;
  const productId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [images, setImages] = useState<string[]>([]);

  const { data: categories } = useListCategories();
  const { data: product, isLoading: isProductLoading } = useGetProduct(productId, {
    query: { enabled: isEdit && !!productId, queryKey: ["getProduct", productId] },
  });

  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: () => { toast({ title: "Product created" }); setLocation("/admin/products"); },
      onError: () => toast({ title: "Error creating product", variant: "destructive" }),
    },
  });

  const updateProduct = useUpdateProduct({
    mutation: {
      onSuccess: () => { toast({ title: "Product updated" }); setLocation("/admin/products"); },
      onError: () => toast({ title: "Error updating product", variant: "destructive" }),
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, salePrice: null, costPrice: null,
      categoryId: 0, stock: 0,
      sizes: "7, 8, 9, 10, 11, 12",
      colors: "Black, White",
      shortDescription: "",
      mainCategory: "men",
      subCategory: "",
      brandLine: "",
      sku: "",
      videoUrl: "",
      isFeatured: false, isNew: true, isOnSale: false,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        costPrice: product.costPrice,
        categoryId: product.categoryId,
        stock: product.stock,
        sizes: product.sizes.join(", "),
        colors: product.colors.map((c: any) => typeof c === "string" ? c : c.name).join(", "),
        shortDescription: product.shortDescription || "",
        mainCategory: product.mainCategory || "men",
        subCategory: product.subCategory || "",
        brandLine: product.brandLine || "",
        sku: product.sku || "",
        videoUrl: (product as any).videoUrl || "",
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale || false,
      });
      const all: string[] = [];
      if (product.imageUrl) all.push(product.imageUrl);
      if (product.imageUrls?.length) {
        product.imageUrls.forEach((u: string) => { if (u && !all.includes(u)) all.push(u); });
      }
      setImages(all.slice(0, MAX_IMAGES));
    }
  }, [product, form]);

  const COLOR_HEX: Record<string, string> = {
    black: "#000000", white: "#ffffff", red: "#ef4444", blue: "#3b82f6",
    green: "#22c55e", yellow: "#eab308", orange: "#f97316", purple: "#a855f7",
    pink: "#ec4899", grey: "#6b7280", gray: "#6b7280", brown: "#92400e",
    navy: "#1e3a5f", beige: "#d4b896", cream: "#fdf6e3", silver: "#c0c0c0",
    gold: "#ffd700", maroon: "#800000", cyan: "#06b6d4", teal: "#14b8a6",
  };

  const onSubmit = (values: FormValues) => {
    if (images.length === 0) {
      toast({ title: "Kam az kam ek image add karein", variant: "destructive" });
      return;
    }
    const colorNames = values.colors.split(",").map((s) => s.trim()).filter(Boolean);
    const formatted = {
      ...values,
      imageUrl: images[0] || "",
      imageUrls: images,
      sizes: values.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colorNames.map((name) => ({ name, hex: COLOR_HEX[name.toLowerCase()] || "#888888" })),
    };
    if (isEdit) updateProduct.mutate({ id: productId, data: formatted });
    else createProduct.mutate({ data: formatted });
  };

  if (isEdit && isProductLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-12 bg-secondary rounded-xl w-1/3" />
        <div className="h-96 bg-secondary rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEdit ? `Editing product #${productId}` : "Add a new product to the NANO SHOES catalog"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Images & Video */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Images className="w-4 h-4" /> Images & Video
            </h2>

            <div>
              <p className="text-sm font-medium mb-3">Product Images <span className="text-muted-foreground text-xs">(max {MAX_IMAGES})</span></p>
              <MultiImagesField images={images} onChange={setImages} />
            </div>

            <FormField control={form.control} name="videoUrl" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Video size={14} /> Video URL (optional)
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://youtube.com/watch?v=... ya direct video link" />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">YouTube, Vimeo, ya koi bhi video link paste karein</p>
                <FormMessage />
                {field.value && (
                  <div className="mt-2 text-xs flex items-center gap-2 text-accent">
                    <Video size={12} /> Video link saved: {field.value.slice(0, 50)}{field.value.length > 50 ? "…" : ""}
                  </div>
                )}
              </FormItem>
            )} />
          </div>

          {/* Basic Details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h2 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Basic Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input {...field} placeholder="NANO Air Max Pro" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="shortDescription" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Short Description</FormLabel>
                  <FormControl><Input {...field} placeholder="One-line tagline..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : undefined}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="brandLine" render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Line</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select brand line" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Nano Air", "Nano Pro", "Nano Flex", "Nano Classic"].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="mainCategory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "men"}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="subCategory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select sub category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["running", "casual", "formal", "sports", "sandals", "boots"].map(s => (
                        <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input {...field} placeholder="NS-AIR-001" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (PKR)</FormLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PKR</span>
                    <FormControl><Input type="number" className="pl-12" {...field} /></FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="salePrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (PKR) — optional</FormLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PKR</span>
                    <FormControl><Input type="number" className="pl-12" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="costPrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price (PKR) — internal</FormLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">PKR</span>
                    <FormControl><Input type="number" className="pl-12" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sizes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sizes (comma separated)</FormLabel>
                  <FormControl><Input placeholder="7, 8, 9, 10, 11, 12" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="colors" render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors (comma separated)</FormLabel>
                  <FormControl><Input placeholder="Black, White, Red" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground mb-5">Visibility & Badges</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="isFeatured" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <FormLabel className="font-bold uppercase tracking-wider">Featured</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">Show on homepage</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="isNew" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <FormLabel className="font-bold uppercase tracking-wider">New Arrival</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">Show "New" badge</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="isOnSale" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <FormLabel className="font-bold uppercase tracking-wider">On Sale</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">Show "Sale" badge</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setLocation("/admin/products")}>Cancel</Button>
            <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="font-display uppercase tracking-wider px-8">
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
