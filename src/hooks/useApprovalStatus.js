import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch approval status
export const useApprovalStatus = (userId) => {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["approvalStatus", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const res = await axios.get(
        `${API_URL}/api/admin/user-approval-status/${userId}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.data?.success) {
        return res.data;
      }
      throw new Error("Failed to fetch approval status");
    },
    enabled: !!userId, // only run if userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Approve/Reject with automatic Sidebar2 update
export const useApprovalMutation = (userId) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.put(
        `${API_URL}/api/admin/user-approval/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      // This is the key: invalidate the approval status query
      // React Query will automatically refetch it
      queryClient.invalidateQueries({
        queryKey: ["approvalStatus", userId],
      });
    },
    onError: (error) => {
      console.error("Approval/Rejection Error:", error);
    },
  });
};
