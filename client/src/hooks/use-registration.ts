import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGenerateCard() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.generateCard.path, {
        method: api.generateCard.method,
        body: formData,
        // vital: do NOT set Content-Type header manually, let browser set boundary
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Failed to generate card");
        } catch {
          throw new Error(errorText || "Failed to generate card");
        }
      }

      // Return the blob for downloading
      return await res.blob();
    },
    onSuccess: (blob) => {
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "identity_card.zip"; // Assuming server zips html + txt
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success!",
        description: "Your Identity Card has been generated and downloaded.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
