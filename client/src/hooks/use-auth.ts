import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type StaffRole = "admin" | "state_meet_president" | "state_president" | null;

export interface AuthState {
  isAdmin: boolean;
  needsPin: boolean;
  role: StaffRole;
  username: string | null;
  displayName: string | null;
}

async function fetchAdminStatus(): Promise<AuthState> {
  const response = await fetch("/api/admin/check", { credentials: "include" });
  if (!response.ok) return { isAdmin: false, needsPin: false, role: null, username: null, displayName: null };
  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AuthState>({
    queryKey: ["/api/admin/check"],
    queryFn: fetchAdminStatus,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/admin/login", { username, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
    },
  });

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) throw new Error("ਗਲਤ PIN");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/check"], { isAdmin: false, needsPin: false, role: null, username: null, displayName: null });
    },
  });

  return {
    isLoading,
    isAuthenticated: !!data?.isAdmin,
    needsPin: !!data?.needsPin,
    role: data?.role ?? null,
    username: data?.username ?? null,
    displayName: data?.displayName ?? null,
    isAdminRole: data?.role === "admin",
    isMeetPresident: data?.role === "state_meet_president",
    isStatePresident: data?.role === "state_president",
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    verifyPin: verifyPinMutation.mutate,
    isVerifyingPin: verifyPinMutation.isPending,
    pinError: verifyPinMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
