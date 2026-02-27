import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertApplicant } from "@shared/schema";

export function useApplicants() {
  return useQuery({
    queryKey: [api.applicants.list.path],
    queryFn: async () => {
      const res = await fetch(api.applicants.list.path);
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return api.applicants.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertApplicant) => {
      const res = await fetch(api.applicants.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create applicant");
      return api.applicants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.applicants.list.path] }),
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, documentStatus }: { id: number; documentStatus: string }) => {
      const url = buildUrl(api.applicants.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.applicants.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.applicants.list.path] }),
  });
}
