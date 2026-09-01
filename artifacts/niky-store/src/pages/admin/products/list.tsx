import { useState } from "react";
import { useListProducts, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useListProducts({ search: search || undefined, limit: 60 });

  const deleteProduct = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      },
      onError: () => toast({ title: "Error deleting product", variant: "destructive" }),
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Delete this product?")) deleteProduct.mutate({ id });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">{productsData?.total ?? "—"} products in catalog</p>
        </div>
        <Link href="/admin132/products/new">
          <Button className="font-display uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Brand Line</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Stock</th>
                <th className="px-5 py-4 font-medium">Tags</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-secondary rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : productsData?.products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No products found.</td>
                </tr>
              ) : (
                productsData?.products.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold line-clamp-1 max-w-[200px]">{product.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{(product as any).mainCategory}/{(product as any).subCategory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{(product as any).brandLine || "—"}</td>
                    <td className="px-5 py-4 font-medium">
                      {product.salePrice ? (
                        <div>
                          <div className="text-accent font-bold">{formatPrice(product.salePrice)}</div>
                          <div className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</div>
                        </div>
                      ) : (
                        <span>{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        product.stock > 10 ? "bg-green-100 text-green-700" :
                        product.stock > 0 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.isFeatured && <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] rounded uppercase font-bold tracking-wider">Featured</span>}
                        {product.isNew && <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[9px] rounded uppercase font-bold tracking-wider">New</span>}
                        {(product as any).isOnSale && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] rounded uppercase font-bold tracking-wider">Sale</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin132/products/${product.id}/edit`} className="cursor-pointer flex items-center">
                              <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
