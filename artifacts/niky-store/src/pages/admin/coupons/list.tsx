import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, getListCouponsQueryKey, Coupon } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminCoupons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: coupons, isLoading } = useListCoupons();

  const createCoupon = useCreateCoupon({
    mutation: {
      onSuccess: () => {
        toast({ title: "Coupon created successfully" });
        queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
        setIsDialogOpen(false);
      },
      onError: (err: any) => {
        toast({ title: err.message || "Error creating coupon", variant: "destructive" });
      }
    }
  });

  const updateCoupon = useUpdateCoupon({
    mutation: {
      onSuccess: () => {
        toast({ title: "Coupon updated successfully" });
        queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
        setIsDialogOpen(false);
      },
      onError: (err: any) => {
        toast({ title: err.message || "Error updating coupon", variant: "destructive" });
      }
    }
  });

  const deleteCoupon = useDeleteCoupon({
    mutation: {
      onSuccess: () => {
        toast({ title: "Coupon deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: err.message || "Error deleting coupon", variant: "destructive" });
      }
    }
  });

  const handleOpenAddDialog = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountAmount("");
    setMinOrderAmount("0");
    setMaxUses("");
    setExpiresAt("");
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountAmount(coupon.discountAmount.toString());
    setMinOrderAmount(coupon.minOrderAmount.toString());
    setMaxUses(coupon.maxUses ? coupon.maxUses.toString() : "");
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "");
    setIsActive(coupon.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
      deleteCoupon.mutate({ id });
    }
  };

  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateCoupon.mutate({ id, data: { isActive: !currentActive } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountAmount: Number(discountAmount),
      minOrderAmount: Number(minOrderAmount),
      maxUses: maxUses ? Number(maxUses) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      isActive
    };

    if (editingCoupon) {
      updateCoupon.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createCoupon.mutate({ data: payload });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes and promotions</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="font-display uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min. Order</th>
                <th className="px-6 py-4">Uses</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading coupons...</td>
                </tr>
              ) : !coupons || coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No coupons found. Create one to get started.</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono bg-secondary px-2 py-1 rounded border font-bold tracking-wider">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountAmount}%` 
                        : `$${coupon.discountAmount.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      ${coupon.minOrderAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM d, yyyy') : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <Switch 
                        checked={coupon.isActive} 
                        onCheckedChange={() => handleToggleActive(coupon.id, coupon.isActive)} 
                        aria-label="Toggle active status"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(coupon)}>
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider text-xl">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input 
                id="code" 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase())} 
                placeholder="e.g. SUMMER24"
                className="font-mono uppercase tracking-widest"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)}>
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Amount</Label>
                <Input 
                  id="discountAmount" 
                  type="number" 
                  min="0"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  value={discountAmount} 
                  onChange={(e) => setDiscountAmount(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
              <Input 
                id="minOrderAmount" 
                type="number" 
                min="0"
                step="0.01"
                value={minOrderAmount} 
                onChange={(e) => setMinOrderAmount(e.target.value)} 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                <Input 
                  id="maxUses" 
                  type="number" 
                  min="1"
                  value={maxUses} 
                  onChange={(e) => setMaxUses(e.target.value)} 
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input 
                  id="expiresAt" 
                  type="date" 
                  value={expiresAt} 
                  onChange={(e) => setExpiresAt(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="isActive" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="isActive">Active immediately</Label>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCoupon.isPending || updateCoupon.isPending} className="font-display uppercase tracking-wider">
                {createCoupon.isPending || updateCoupon.isPending ? "Saving..." : "Save Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}