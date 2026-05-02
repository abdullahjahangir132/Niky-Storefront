import { useState } from "react";
import { useListCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, getListCouponsQueryKey, Coupon } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";

export default function AdminCoupons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
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
      onSuccess: () => { toast({ title: "Coupon created" }); queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() }); setIsDialogOpen(false); },
      onError: (err: any) => toast({ title: err.message || "Error creating coupon", variant: "destructive" }),
    },
  });

  const updateCoupon = useUpdateCoupon({
    mutation: {
      onSuccess: () => { toast({ title: "Coupon updated" }); queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() }); setIsDialogOpen(false); },
      onError: (err: any) => toast({ title: err.message || "Error updating coupon", variant: "destructive" }),
    },
  });

  const deleteCoupon = useDeleteCoupon({
    mutation: {
      onSuccess: () => { toast({ title: "Coupon deleted" }); queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() }); },
      onError: (err: any) => toast({ title: err.message || "Error deleting coupon", variant: "destructive" }),
    },
  });

  const openAdd = () => {
    setEditingCoupon(null);
    setCode(""); setDiscountType("percentage"); setDiscountAmount("");
    setMinOrderAmount("0"); setMaxUses(""); setExpiresAt(""); setIsActive(true);
    setIsDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code); setDiscountType(coupon.discountType as "percentage" | "fixed");
    setDiscountAmount(coupon.discountAmount.toString());
    setMinOrderAmount(coupon.minOrderAmount.toString());
    setMaxUses(coupon.maxUses ? coupon.maxUses.toString() : "");
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "");
    setIsActive(coupon.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this coupon?")) deleteCoupon.mutate({ id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.toUpperCase(), discountType,
      discountAmount: Number(discountAmount),
      minOrderAmount: Number(minOrderAmount),
      maxUses: maxUses ? Number(maxUses) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      isActive,
    };
    if (editingCoupon) updateCoupon.mutate({ id: editingCoupon.id, data: payload });
    else createCoupon.mutate({ data: payload });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes and promotions</p>
        </div>
        <Button onClick={openAdd} className="font-display uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Code</th>
                <th className="px-5 py-4 font-medium">Discount</th>
                <th className="px-5 py-4 font-medium">Min. Order</th>
                <th className="px-5 py-4 font-medium">Uses</th>
                <th className="px-5 py-4 font-medium">Expires</th>
                <th className="px-5 py-4 font-medium">Active</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-secondary rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : !coupons || coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No coupons yet. Create one to start offering discounts.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono bg-secondary px-2.5 py-1 rounded-lg border border-border font-bold tracking-wider text-sm">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-accent">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountAmount}% OFF`
                        : `${formatPrice(coupon.discountAmount)} OFF`}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatPrice(coupon.minOrderAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium">{coupon.usedCount}</span>
                      {coupon.maxUses ? <span className="text-muted-foreground"> / {coupon.maxUses}</span> : ""}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {coupon.expiresAt ? format(new Date(coupon.expiresAt), "dd MMM yyyy") : "Never"}
                    </td>
                    <td className="px-5 py-4">
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => updateCoupon.mutate({ id: coupon.id, data: { isActive: !coupon.isActive } })}
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(coupon)}>
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(coupon.id)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider text-xl">
              {editingCoupon ? "Edit Coupon" : "New Coupon"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. NANO20"
                className="font-mono uppercase tracking-widest"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (PKR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" min="0" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Min Order Amount (PKR)</Label>
              <Input type="number" min="0" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Uses (optional)</Label>
                <Input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Expires (optional)</Label>
                <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active">Active immediately</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCoupon.isPending || updateCoupon.isPending} className="font-display uppercase tracking-wider">
                {createCoupon.isPending || updateCoupon.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
