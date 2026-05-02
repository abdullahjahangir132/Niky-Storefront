import { createContext, useContext } from "react";
import { useAdminGetMe, useAdminLogin, useAdminLogout, getAdminGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: ReturnType<typeof useAdminLogin>["mutate"];
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, refetch } = useAdminGetMe({
    query: { retry: false, queryKey: getAdminGetMeQueryKey() },
  });

  const loginMutation = useAdminLogin({
    mutation: { onSuccess: () => refetch() },
  });

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getAdminGetMeQueryKey(), null);
        refetch();
      },
    },
  });

  const logout = () => logoutMutation.mutate(undefined);
  const isLoading = isUserLoading || loginMutation.isPending || logoutMutation.isPending;
  const isAuthenticated = !!user?.authenticated;

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login: loginMutation.mutate, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
}
