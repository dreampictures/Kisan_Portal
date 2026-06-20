import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

async function fetchAdminStatus(): Promise<{ isAdmin: boolean; needsPin: boolean }> {
  const response = await fetch("/api/admin/check", {
    credentials: "include",
  });
  if (!response.ok) return { isAdmin: false, needsPin: false };
  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ isAdmin: boolean; needsPin: boolean }>({
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
      queryClient.setQueryData(["/api/admin/check"], { isAdmin: false, needsPin: false });
    },
  });

  return {
    isLoading,
    isAuthenticated: !!data?.isAdmin,
    needsPin: !!data?.needsPin,
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
