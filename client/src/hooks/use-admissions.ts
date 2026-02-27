import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAdmission } from "@shared/schema";

export function useAdmissions() {
  return useQuery({
    queryKey: [api.admissions.list.path],
    queryFn: async () => {
      const res = await fetch(api.admissions.list.path);
      if (!res.ok) throw new Error("Failed to fetch admissions");
      return api.admissions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAdmission) => {
      const res = await fetch(api.admissions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 409) throw new Error("Seat overbooked / Conflict");
        throw new Error("Failed to allocate admission");
      }
      return api.admissions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admissions.list.path] }),
  });
}

export function useConfirmAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admissions.confirm.path, { id });
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Failed to confirm admission");
      return api.admissions.confirm.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admissions.list.path] }),
  });
}

export function useUpdateFeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, feeStatus }: { id: number; feeStatus: string }) => {
      const url = buildUrl(api.admissions.updateFee.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeStatus }),
      });
      if (!res.ok) throw new Error("Failed to update fee status");
      return api.admissions.updateFee.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admissions.list.path] }),
  });
}
