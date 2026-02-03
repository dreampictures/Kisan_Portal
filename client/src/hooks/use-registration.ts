import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { Registration } from "@shared/schema";

export function useSubmitRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.registrations.submit.path, {
        method: api.registrations.submit.method,
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ ਹੋ ਗਈ");
        } catch {
          throw new Error(errorText || "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ ਹੋ ਗਈ");
        }
      }

      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "ਸਫਲਤਾ!",
        description: data.message,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/registrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "ਗਲਤੀ",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRegistrations() {
  return useQuery<Registration[]>({
    queryKey: ['/api/admin/registrations'],
    queryFn: async () => {
      const res = await fetch(api.registrations.list.path, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("401: Unauthorized");
        }
        throw new Error("ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ");
      }
      return res.json();
    },
    retry: false,
  });
}

export function useDeleteRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error("ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "ਸਫਲਤਾ!",
        description: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਟਾਈ ਗਈ",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/registrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "ਗਲਤੀ",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDownloadRegistrations() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/registrations/download', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error("ਡਾਊਨਲੋਡ ਫੇਲ੍ਹ ਹੋ ਗਈ");
      }
      return res.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "registrations.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "ਸਫਲਤਾ!",
        description: "ਸਾਰੀਆਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ ਡਾਊਨਲੋਡ ਕੀਤੀਆਂ ਗਈਆਂ",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "ਗਲਤੀ",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
