import { useEffect } from "react";
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
import { ArrowLeft, Package } from "lucide-react";
import { Link } from "wouter";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().min(1, "Price must be > 0"),
  salePrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().min(1, "Category is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sizes: z.string().min(1, "At least one size required"),
  colors: z.string().min(1, "At least one color required"),
  shortDescription: z.string().optional(),
  mainCategory: z.string().optional(),
  subCategory: z.string().optional(),
  brandLine: z.string().optional(),
  sku: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
});

type FormValues = {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  costPrice?: number | null;
  categoryId: number;
  imageUrl: string;
  stock: number;
  sizes: string;
  colors: string;
  shortDescription?: string;
  mainCategory?: string;
  subCategory?: string;
  brandLine?: string;
  sku?: string;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
};

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const isEdit = !!params?.id;
  const productId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
    resolver: zodResolver(productSchema as any),
    defaultValues: {
      name: "", description: "", price: 0, salePrice: null, costPrice: null,
      categoryId: 0, imageUrl: "", stock: 0,
      sizes: "7, 8, 9, 10, 11, 12",
      colors: "Black, White",
      shortDescription: "",
      mainCategory: "men",
      subCategory: "",
      brandLine: "",
      sku: "",
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
        imageUrl: product.imageUrl,
        stock: product.stock,
        sizes: product.sizes.join(", "),
        colors: product.colors.map(c => typeof c === 'string' ? c : c.name).join(", "),
        shortDescription: product.shortDescription || "",
        mainCategory: product.mainCategory || "men",
        subCategory: product.subCategory || "",
        brandLine: product.brandLine || "",
        sku: product.sku || "",
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale || false,
      });
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
    const colorNames = values.colors.split(",").map((s) => s.trim()).filter(Boolean);
    const formatted = {
      ...values,
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
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
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

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Primary Image URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://images.unsplash.com/..." /></FormControl>
                  <FormMessage />
                  {field.value && (
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={field.value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
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
