import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
    // Adding placeholder data for UI rendering gracefully while backend catches up or if endpoint missing
    placeholderData: {
      programsIntake: [
        { program: "B.Tech CSE", intake: 120, admitted: 85 },
        { program: "B.Tech ECE", intake: 60, admitted: 60 },
        { program: "B.Tech ME", intake: 60, admitted: 20 },
      ],
      quotaStats: [
        { quotaType: "KCET", filled: 100, remaining: 50 },
        { quotaType: "COMEDK", filled: 45, remaining: 15 },
        { quotaType: "Management", filled: 20, remaining: 10 },
      ],
      pendingDocuments: 14,
      pendingFees: 8,
      pendingFeeList: [],
    }
  });
}
