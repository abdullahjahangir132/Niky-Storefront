import { createContext, useContext, useState, ReactNode } from "react";
import { useGetCart, useAddToCart, useUpdateCartItem, useRemoveCartItem, useClearCart, getGetCartQueryKey, CartItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (productId: number, size: string, color: string, quantity: number) => void;
  updateQty: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartItems, isLoading } = useGetCart();

  const items: CartItem[] = cartItems || [];
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.salePrice || item.price) * item.quantity, 0);

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const addMutation = useAddToCart({
    mutation: {
      onSuccess: () => {
        invalidateCart();
        toast({ title: "Added to cart" });
        setIsCartDrawerOpen(true);
      },
    },
  });

  const updateMutation = useUpdateCartItem({
    mutation: { onSuccess: invalidateCart },
  });

  const removeMutation = useRemoveCartItem({
    mutation: { onSuccess: invalidateCart },
  });

  const clearMutation = useClearCart({
    mutation: { onSuccess: invalidateCart },
  });

  const addItem = (productId: number, size: string, color: string, quantity: number) => {
    addMutation.mutate({ data: { productId, size, color, quantity } });
  };

  const updateQty = (id: number, quantity: number) => {
    updateMutation.mutate({ id, data: { quantity } });
  };

  const removeItem = (id: number) => {
    removeMutation.mutate({ id });
  };

  const clearCart = () => {
    clearMutation.mutate(undefined);
  };

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, isLoading, addItem, updateQty, removeItem, clearCart, isCartDrawerOpen, setIsCartDrawerOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
}
