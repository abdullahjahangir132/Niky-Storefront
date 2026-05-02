import { createContext, useContext, ReactNode } from "react";
import {
  useGetMe, useLoginUser, useRegisterUser, useLogoutUser, getGetMeQueryKey,
  UserProfile, LoginBody, RegisterBody,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UserAuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (data: LoginBody) => void;
  register: (data: RegisterBody) => void;
  logout: () => void;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: { retry: false, queryKey: getGetMeQueryKey() },
  });

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: () => { refetch(); toast({ title: "Welcome back!" }); },
      onError: (err: any) => toast({ title: "Login failed", description: err?.message || "Invalid credentials", variant: "destructive" }),
    },
  });

  const registerMutation = useRegisterUser({
    mutation: {
      onSuccess: () => { refetch(); toast({ title: "Account created successfully" }); },
      onError: (err: any) => toast({ title: "Registration failed", description: err?.message || "An error occurred", variant: "destructive" }),
    },
  });

  const logoutMutation = useLogoutUser({
    mutation: {
      onSuccess: () => { queryClient.setQueryData(getGetMeQueryKey(), null); refetch(); toast({ title: "Logged out" }); },
    },
  });

  const login = (data: LoginBody) => loginMutation.mutate({ data });
  const register = (data: RegisterBody) => registerMutation.mutate({ data });
  const logout = () => logoutMutation.mutate(undefined);

  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;
  const isLoggedIn = !!user;

  return (
    <UserAuthContext.Provider value={{ user: user || null, isLoggedIn, isLoading, login, register, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) throw new Error("useUserAuth must be used within a UserAuthProvider");
  return context;
}
