import useSWR from "swr";
import type { UserSettings } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UseSettings() {
  const { data, error, isLoading, mutate } = useSWR<UserSettings>(
    "/api/settings",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }

      const updated = await response.json();

      await mutate(updated, false);

      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    settings: data,
    isLoading,
    error,
    updateSettings,
    mutate,
  };
}
