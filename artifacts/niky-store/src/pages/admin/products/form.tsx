import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
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
import { ArrowLeft } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  salePrice: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sizes: z.string().transform(val => val.split(",").map(s => s.trim()).filter(Boolean)),
  colors: z.string().transform(val => val.split(",").map(s => s.trim()).filter(Boolean)),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

type FormValues = {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  categoryId: number;
  imageUrl: string;
  stock: number;
  sizes: string;
  colors: string;
  isFeatured: boolean;
  isNew: boolean;
};

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const isEdit = !!params?.id;
  const productId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: categories } = useListCategories();
  const { data: product, isLoading: isProductLoading } = useGetProduct(productId, {
    query: { enabled: isEdit && !!productId }
  });

  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Product created successfully" });
        setLocation("/admin/products");
      },
      onError: () => toast({ title: "Error creating product", variant: "destructive" })
    }
  });

  const updateProduct = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Product updated successfully" });
        setLocation("/admin/products");
      },
      onError: () => toast({ title: "Error updating product", variant: "destructive" })
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema as any), // Type assertion workaround for string -> array transforms
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      salePrice: null,
      categoryId: 0,
      imageUrl: "",
      stock: 0,
      sizes: "7, 8, 9, 10, 11, 12",
      colors: "Black, White",
      isFeatured: false,
      isNew: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        stock: product.stock,
        sizes: product.sizes.join(", "),
        colors: product.colors.join(", "),
        isFeatured: product.isFeatured,
        isNew: product.isNew,
      });
    }
  }, [product, form]);

  const onSubmit = (values: FormValues) => {
    // Convert back the strings to arrays since useForm doesn't run the transform before submission
    const formattedValues = {
      ...values,
      sizes: values.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: values.colors.split(",").map(s => s.trim()).filter(Boolean),
    };

    if (isEdit) {
      updateProduct.mutate({ id: productId, data: formattedValues });
    } else {
      createProduct.mutate({ data: formattedValues });
    }
  };

  if (isEdit && isProductLoading) return <AdminLayout><div className="p-8 text-center">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/products")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-4xl uppercase tracking-tight">
              {isEdit ? "Edit Product" : "New Product"}
            </h1>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map(cat => (
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
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="salePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price ($) - Optional</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Primary Image URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sizes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sizes (comma separated)</FormLabel>
                    <FormControl><Input placeholder="7, 8, 9, 10" {...field} /></FormControl>
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
                    <FormControl><Textarea rows={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="md:col-span-2 flex gap-8 border-t pt-6">
                  <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold uppercase tracking-wider">Featured</FormLabel>
                        <div className="text-sm text-muted-foreground">Show on homepage</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="isNew" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold uppercase tracking-wider">New Arrival</FormLabel>
                        <div className="text-sm text-muted-foreground">Add 'New' badge</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t pt-8">
                <Button type="button" variant="outline" onClick={() => setLocation("/admin/products")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="font-display uppercase tracking-wider px-8">
                  {isEdit ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}