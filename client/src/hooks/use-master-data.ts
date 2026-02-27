import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertInstitution, type InsertCampus, type InsertDepartment, type InsertProgram, type InsertQuota } from "@shared/schema";

// Institutions
export function useInstitutions() {
  return useQuery({
    queryKey: [api.institutions.list.path],
    queryFn: async () => {
      const res = await fetch(api.institutions.list.path);
      if (!res.ok) throw new Error("Failed to fetch institutions");
      return api.institutions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertInstitution) => {
      const res = await fetch(api.institutions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create institution");
      return api.institutions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.institutions.list.path] }),
  });
}

// Campuses
export function useCampuses() {
  return useQuery({
    queryKey: [api.campuses.list.path],
    queryFn: async () => {
      const res = await fetch(api.campuses.list.path);
      if (!res.ok) throw new Error("Failed to fetch campuses");
      return api.campuses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCampus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCampus) => {
      const res = await fetch(api.campuses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create campus");
      return api.campuses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.campuses.list.path] }),
  });
}

// Departments
export function useDepartments() {
  return useQuery({
    queryKey: [api.departments.list.path],
    queryFn: async () => {
      const res = await fetch(api.departments.list.path);
      if (!res.ok) throw new Error("Failed to fetch departments");
      return api.departments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDepartment) => {
      const res = await fetch(api.departments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create department");
      return api.departments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.departments.list.path] }),
  });
}

// Programs
export function usePrograms() {
  return useQuery({
    queryKey: [api.programs.list.path],
    queryFn: async () => {
      const res = await fetch(api.programs.list.path);
      if (!res.ok) throw new Error("Failed to fetch programs");
      return api.programs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProgram) => {
      const res = await fetch(api.programs.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create program");
      return api.programs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.programs.list.path] }),
  });
}

// Quotas
export function useQuotas() {
  return useQuery({
    queryKey: [api.quotas.list.path],
    queryFn: async () => {
      const res = await fetch(api.quotas.list.path);
      if (!res.ok) throw new Error("Failed to fetch quotas");
      return api.quotas.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateQuota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertQuota) => {
      const res = await fetch(api.quotas.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create quota");
      return api.quotas.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.quotas.list.path] }),
  });
}
