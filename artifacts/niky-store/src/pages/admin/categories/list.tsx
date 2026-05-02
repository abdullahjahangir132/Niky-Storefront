import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AdminCategories() {
  const { data: categories, isLoading } = useListCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", imageUrl: "" });

  const createCategory = useCreateCategory({
    mutation: {
      onSuccess: () => { toast({ title: "Category created" }); setIsOpen(false); resetForm(); queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); },
      onError: () => toast({ title: "Error creating category", variant: "destructive" }),
    },
  });

  const updateCategory = useUpdateCategory({
    mutation: {
      onSuccess: () => { toast({ title: "Category updated" }); setIsOpen(false); resetForm(); queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); },
      onError: () => toast({ title: "Error updating category", variant: "destructive" }),
    },
  });

  const deleteCategory = useDeleteCategory({
    mutation: {
      onSuccess: () => { toast({ title: "Category deleted" }); queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); },
      onError: () => toast({ title: "Error deleting category", variant: "destructive" }),
    },
  });

  const resetForm = () => { setFormData({ name: "", description: "", imageUrl: "" }); setEditingId(null); };

  const handleEdit = (category: any) => {
    setFormData({ name: category.name, description: category.description, imageUrl: category.imageUrl });
    setEditingId(category.id);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this category?")) deleteCategory.mutate({ id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateCategory.mutate({ id: editingId, data: formData });
    else createCategory.mutate({ data: formData });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage product categories</p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-display uppercase tracking-wider"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-2xl tracking-tight">{editingId ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>{editingId ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse border border-border rounded-2xl overflow-hidden">
              <div className="h-48 bg-secondary" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/4" />
              </div>
            </div>
          ))
        ) : categories?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground">No categories found.</div>
        ) : (
          categories?.map((category) => (
            <div key={category.id} className="bg-card border border-border rounded-2xl overflow-hidden group">
              <div className="h-48 bg-secondary relative overflow-hidden flex items-center justify-center">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-display font-bold text-2xl text-white uppercase tracking-tight">{category.name}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold px-2.5 py-1 bg-secondary rounded-full">{category.productCount} products</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => handleDelete(category.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
